<?php

namespace App\Jobs;

use App\Models\MemoryExport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CleanExpiredExportsJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $expiredExports = MemoryExport::where('expires_at', '<=', now())
            ->whereNotNull('file_path')
            ->get();

        Log::info("Cleaning up {$expiredExports->count()} expired memory exports.");

        foreach ($expiredExports as $export) {
            if (Storage::disk('local')->exists($export->file_path)) {
                Storage::disk('local')->delete($export->file_path);
            }

            $export->update([
                'status' => 'expired',
                'file_path' => null,
            ]);
        }
    }
}
