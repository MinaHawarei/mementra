<?php

use App\Jobs\CleanExpiredExportsJob;
use App\Jobs\GenerateMemoryBookJob;
use App\Models\JournalEntry;
use App\Models\MemoryExport;
use App\Models\User;
use App\Services\Export\PdfExportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('user can initiate memory book export', function () {
    Queue::fake();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/exports', [
        'title' => 'Our Living Book 2026',
        'date_from' => '2026-01-01',
        'date_to' => '2026-12-31',
        'locale' => 'en',
    ]);

    $response->assertRedirect('/exports');

    expect(MemoryExport::count())->toBe(1);
    $export = MemoryExport::first();
    expect($export->user_id)->toBe($user->id);
    expect($export->title)->toBe('Our Living Book 2026');

    Queue::assertPushed(GenerateMemoryBookJob::class);
});

test('PdfExportService compiles book and stores file', function () {
    $user = User::factory()->create();
    JournalEntry::factory()->count(2)->create(['user_id' => $user->id, 'entry_date' => '2026-05-10']);

    $service = new PdfExportService;
    $export = $service->createExport($user, [
        'title' => 'PDF Book Test',
    ]);

    $service->generateBookPdf($export);

    $export->refresh();
    expect($export->status)->toBe('completed');
    expect($export->file_path)->not->toBeNull();
    expect(Storage::disk('local')->exists($export->file_path))->toBeTrue();
});

test('download requires export owner', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();

    $service = new PdfExportService;
    $export = $service->createExport($owner, ['title' => 'Private Book']);
    $service->generateBookPdf($export);

    $this->actingAs($stranger)->get("/exports/{$export->id}/download")->assertForbidden();
    $this->actingAs($owner)->get("/exports/{$export->id}/download")->assertSuccessful();
});

test('CleanExpiredExportsJob deletes expired files', function () {
    $user = User::factory()->create();
    $service = new PdfExportService;
    $export = $service->createExport($user, ['title' => 'Expired Book']);
    $service->generateBookPdf($export);

    $export->update(['expires_at' => now()->subDay()]);

    $job = new CleanExpiredExportsJob;
    $job->handle();

    $export->refresh();
    expect($export->status)->toBe('expired');
    expect($export->file_path)->toBeNull();
});
