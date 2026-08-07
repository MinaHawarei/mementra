<?php

use App\Jobs\CleanExpiredExportsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('reminders:process')->everyMinute();
Schedule::job(new CleanExpiredExportsJob)->daily();
