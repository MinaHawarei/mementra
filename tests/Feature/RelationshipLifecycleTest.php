<?php

use App\Enums\RelationshipStatus;
use App\Enums\RelationshipType;
use App\Enums\TimelineEventType;
use App\Models\Relationship;
use App\Models\TimelineEvent;
use App\Models\User;
use App\Notifications\PartnerInvitationAcceptedNotification;
use App\Notifications\PartnerInvitationNotification;
use App\Services\RelationshipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('user can send partner connection invitation successfully', function () {
    Notification::fake();

    $user = User::factory()->create(['name' => 'Alice', 'email' => 'alice@example.com']);
    $partner = User::factory()->create(['name' => 'Bob', 'email' => 'bob@example.com']);

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => 'bob@example.com',
        'name' => 'Alice & Bob',
        'type' => 'couple',
    ]);

    $response->assertRedirect('/relationship');
    $response->assertSessionHas('success');

    $rel = Relationship::where('status', RelationshipStatus::Pending)->first();
    expect($rel)->not->toBeNull()
        ->and($rel->created_by)->toBe($user->id)
        ->and($rel->name)->toBe('Alice & Bob')
        ->and($rel->members)->toHaveCount(2);

    Notification::assertSentTo($partner, PartnerInvitationNotification::class);
});

test('inviting self fails validation', function () {
    $user = User::factory()->create(['email' => 'self@example.com']);

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => 'self@example.com',
    ]);

    $response->assertSessionHasErrors(['partner_email']);
    expect(Relationship::count())->toBe(0);
});

test('inviting unregistered email fails validation with helpful message', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => 'nonexistent@example.com',
    ]);

    $response->assertSessionHasErrors(['partner_email']);
});

test('user already in active relationship cannot send invitation', function () {
    $user = User::factory()->create();
    $existingPartner = User::factory()->create();
    $newPartner = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($user, $existingPartner);
    $service->acceptConnection($rel);

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => $newPartner->email,
    ]);

    $response->assertSessionHasErrors(['partner_email']);
});

test('inviting a partner who is already connected fails validation', function () {
    $user = User::factory()->create();
    $busyPartner = User::factory()->create();
    $otherUser = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($busyPartner, $otherUser);
    $service->acceptConnection($rel);

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => $busyPartner->email,
    ]);

    $response->assertSessionHasErrors(['partner_email']);
});

test('duplicate pending invitation fails validation', function () {
    $user = User::factory()->create();
    $partner = User::factory()->create();

    $service = app(RelationshipService::class);
    $service->initiateConnection($user, $partner);

    $response = $this->actingAs($user)->post('/relationship', [
        'partner_email' => $partner->email,
    ]);

    $response->assertSessionHasErrors(['partner_email']);
});

test('recipient can accept pending invitation and activates relationship', function () {
    Notification::fake();

    $creator = User::factory()->create(['name' => 'John']);
    $recipient = User::factory()->create(['name' => 'Jane']);

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);

    $response = $this->actingAs($recipient)->post("/relationship/{$rel->id}/accept");

    $response->assertRedirect('/relationship');
    $response->assertSessionHas('success');

    $freshRel = $rel->fresh();
    expect($freshRel->status)->toBe(RelationshipStatus::Active)
        ->and($freshRel->connected_at)->not->toBeNull();

    // Timeline event recorded for both
    expect(TimelineEvent::where('user_id', $creator->id)->where('event_type', TimelineEventType::RelationshipStarted)->exists())->toBeTrue();
    expect(TimelineEvent::where('user_id', $recipient->id)->where('event_type', TimelineEventType::RelationshipStarted)->exists())->toBeTrue();

    Notification::assertSentTo($creator, PartnerInvitationAcceptedNotification::class);
});

test('creator cannot accept their own pending invitation', function () {
    $creator = User::factory()->create();
    $recipient = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);

    $response = $this->actingAs($creator)->post("/relationship/{$rel->id}/accept");

    $response->assertForbidden();
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Pending);
});

test('recipient can decline pending invitation', function () {
    $creator = User::factory()->create();
    $recipient = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);

    $response = $this->actingAs($recipient)->post("/relationship/{$rel->id}/decline");

    $response->assertRedirect('/relationship');
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Rejected);
});

test('creator can cancel their outgoing pending invitation', function () {
    $creator = User::factory()->create();
    $recipient = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);

    $response = $this->actingAs($creator)->post("/relationship/{$rel->id}/cancel");

    $response->assertRedirect('/relationship');
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Cancelled);
});

test('recipient cannot cancel invitation using creator cancel endpoint', function () {
    $creator = User::factory()->create();
    $recipient = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);

    $this->actingAs($recipient)->post("/relationship/{$rel->id}/cancel")->assertForbidden();
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Pending);
});

test('either partner can end active relationship', function () {
    $creator = User::factory()->create();
    $recipient = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($creator, $recipient);
    $service->acceptConnection($rel);

    // Recipient ends relationship
    $response = $this->actingAs($recipient)->post("/relationship/{$rel->id}/end");

    $response->assertRedirect('/relationship');
    expect($rel->fresh()->status)->toBe(RelationshipStatus::Ended)
        ->and($rel->fresh()->ended_at)->not->toBeNull();

    // Timeline event recorded
    expect(TimelineEvent::where('user_id', $recipient->id)->where('event_type', TimelineEventType::RelationshipEnded)->exists())->toBeTrue();
});

test('unrelated third party cannot accept, decline, or end relationship', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $stranger = User::factory()->create();

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($user1, $user2);

    $this->actingAs($stranger)->post("/relationship/{$rel->id}/accept")->assertForbidden();
    $this->actingAs($stranger)->post("/relationship/{$rel->id}/decline")->assertForbidden();
    $this->actingAs($stranger)->post("/relationship/{$rel->id}/cancel")->assertForbidden();
    $this->actingAs($stranger)->post("/relationship/{$rel->id}/end")->assertForbidden();
});

test('relationship index page renders properly with unwrapped array members and partner info', function () {
    $user = User::factory()->create(['name' => 'Liam']);
    $partner = User::factory()->create(['name' => 'Sophia']);

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($user, $partner, RelationshipType::Couple, 'Liam & Sophia');
    $service->acceptConnection($rel);

    $response = $this->actingAs($user)->get('/relationship');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('relationship/index')
        ->has('relationships', 1)
        ->where('relationships.0.id', $rel->id)
        ->where('relationships.0.status', 'active')
        ->where('relationships.0.is_creator', true)
        ->where('relationships.0.partner.id', $partner->id)
        ->where('relationships.0.partner.name', 'Sophia')
        ->has('relationships.0.members', 2)
    );
});

test('dashboard page renders active relationship without wrapping or errors', function () {
    $user = User::factory()->create(['name' => 'Noah']);
    $partner = User::factory()->create(['name' => 'Emma']);

    $service = app(RelationshipService::class);
    $rel = $service->initiateConnection($user, $partner);
    $service->acceptConnection($rel);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('relationship', fn ($r) => $r
            ->where('id', $rel->id)
            ->where('status', 'active')
            ->where('partner.name', 'Emma')
            ->has('members', 2)
            ->etc()
        )
    );
});
