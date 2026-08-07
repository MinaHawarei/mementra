<?php

use App\Http\Controllers\Api\V1\EventController;
use App\Http\Controllers\Api\V1\JournalEntryController;
use App\Http\Controllers\Api\V1\MemoryShareController;
use App\Http\Controllers\Api\V1\RelationshipController;
use App\Http\Controllers\Api\V1\ReminderController;
use App\Http\Controllers\Api\V1\TimelineController;
use App\Http\Resources\Api\V1\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:60,1'])->prefix('v1')->as('api.v1.')->group(function () {
    Route::get('/me', function (Request $request) {
        return new UserResource($request->user());
    });

    Route::apiResource('journal', JournalEntryController::class);

    Route::post('journal/{journalEntry}/shares', [MemoryShareController::class, 'store']);
    Route::delete('shares/{memoryShare}', [MemoryShareController::class, 'destroy']);

    Route::get('relationships', [RelationshipController::class, 'index']);
    Route::post('relationships', [RelationshipController::class, 'store']);
    Route::post('relationships/{relationship}/accept', [RelationshipController::class, 'accept']);
    Route::post('relationships/{relationship}/decline', [RelationshipController::class, 'decline']);
    Route::post('relationships/{relationship}/end', [RelationshipController::class, 'end']);

    Route::apiResource('events', EventController::class)->except(['update']);
    Route::apiResource('reminders', ReminderController::class)->except(['show', 'update']);

    Route::get('timeline', [TimelineController::class, 'index']);
});
