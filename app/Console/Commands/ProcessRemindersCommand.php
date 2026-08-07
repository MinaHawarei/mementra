<?php

namespace App\Console\Commands;

use App\Jobs\ProcessDueRemindersJob;
use Illuminate\Console\Command;

class ProcessRemindersCommand extends Command
{
    protected $signature = 'reminders:process';

    protected $description = 'Dispatch job to process all due reminders';

    public function handle(): int
    {
        ProcessDueRemindersJob::dispatch();

        $this->info('Due reminders processing job dispatched successfully.');

        return self::SUCCESS;
    }
}
