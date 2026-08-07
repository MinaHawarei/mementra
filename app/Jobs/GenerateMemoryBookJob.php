<?php

namespace App\Jobs;

use App\Models\MemoryExport;
use App\Services\Export\ExportServiceInterface;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateMemoryBookJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public MemoryExport $export) {}

    public function handle(ExportServiceInterface $service): void
    {
        $this->export->update(['status' => 'processing']);

        try {
            $service->generateBookPdf($this->export);
        } catch (Exception $e) {
            Log::error('Memory Book export failed: '.$e->getMessage(), ['export_id' => $this->export->id]);

            $this->export->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}
