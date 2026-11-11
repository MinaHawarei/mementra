<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('privacy policy is publicly accessible to guests and returns http 200', function () {
    $response = $this->get(route('legal.privacy-policy'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('legal/privacy-policy')
            ->has('lastUpdated')
        );
});

test('terms of service is publicly accessible to guests and returns http 200', function () {
    $response = $this->get(route('legal.terms'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('legal/terms')
            ->has('lastUpdated')
        );
});

test('authenticated users can access legal pages without redirection', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('legal.privacy-policy'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('legal/privacy-policy'));

    $this->actingAs($user)
        ->get(route('legal.terms'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('legal/terms'));
});

test('welcome page renders successfully for guests', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('welcome'));
});

test('legal routes are properly named and resolve to expected paths', function () {
    expect(route('legal.privacy-policy'))->toContain('/privacy-policy')
        ->and(route('legal.terms'))->toContain('/terms');
});
