<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EventController;
use App\Http\Controllers\Web\ExportController;
use App\Http\Controllers\Web\JournalController;
use App\Http\Controllers\Web\MediaController;
use App\Http\Controllers\Web\MemoriesController;
use App\Http\Controllers\Web\RelationshipController;
use App\Http\Controllers\Web\ReminderController;
use App\Http\Controllers\Web\ShareController;
use App\Http\Controllers\Web\TimelineController;
use App\Http\Controllers\Web\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('journal', JournalController::class);
    Route::post('journal/{journal}/remember', [JournalController::class, 'rememberThis'])->name('journal.remember');
    Route::post('journal/{journal}/share', [ShareController::class, 'store'])->name('journal.share');
    Route::delete('shares/{share}', [ShareController::class, 'destroy'])->name('shares.destroy');

    Route::get('exports', [ExportController::class, 'index'])->name('exports.index');
    Route::post('exports', [ExportController::class, 'store'])->name('exports.store');
    Route::get('exports/{export}/download', [ExportController::class, 'download'])->name('exports.download');

    Route::get('memories', [MemoriesController::class, 'index'])->name('memories.index');
    Route::get('media/{media}/file', [MediaController::class, 'show'])->name('media.show');

    Route::get('timeline', [TimelineController::class, 'index'])->name('timeline.index');

    Route::resource('events', EventController::class)->only(['index', 'store', 'destroy']);

    Route::resource('reminders', ReminderController::class)->only(['index', 'store', 'destroy']);

    Route::get('relationship', [RelationshipController::class, 'index'])->name('relationship.index');
    Route::post('relationship', [RelationshipController::class, 'store'])->name('relationship.store');
    Route::post('relationship/{relationship}/accept', [RelationshipController::class, 'accept'])->name('relationship.accept');
    Route::post('relationship/{relationship}/end', [RelationshipController::class, 'end'])->name('relationship.end');

    Route::patch('settings/preferences', [UserSettingsController::class, 'updatePreferences'])->name('settings.preferences.update');
});

require __DIR__.'/settings.php';
