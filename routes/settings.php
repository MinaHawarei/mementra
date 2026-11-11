<?php

use App\Http\Controllers\Settings\GoogleDriveIntegrationController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings/integrations', [GoogleDriveIntegrationController::class, 'index'])->name('integrations.index');
    Route::get('integrations/google-drive/redirect', [GoogleDriveIntegrationController::class, 'redirect'])->name('integrations.google-drive.redirect');
    Route::get('integrations/google-drive/callback', [GoogleDriveIntegrationController::class, 'callback'])->name('integrations.google-drive.callback');
    Route::delete('integrations/google-drive/disconnect', [GoogleDriveIntegrationController::class, 'disconnect'])->name('integrations.google-drive.disconnect');
    Route::post('integrations/google-drive/test', [GoogleDriveIntegrationController::class, 'testConnection'])->name('integrations.google-drive.test');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
