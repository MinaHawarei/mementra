<?php

namespace App\Services\Export;

use App\Models\Event;
use App\Models\JournalEntry;
use App\Models\MemoryExport;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class PdfExportService implements ExportServiceInterface
{
    public function createExport(User $user, array $params): MemoryExport
    {
        return MemoryExport::create([
            'user_id' => $user->id,
            'title' => $params['title'] ?? 'Our Story — Memory Book',
            'date_from' => $params['date_from'] ?? null,
            'date_to' => $params['date_to'] ?? null,
            'locale' => $params['locale'] ?? $user->locale?->value ?? 'en',
            'timezone' => $params['timezone'] ?? $user->timezone ?? 'UTC',
            'format' => 'pdf',
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function generateBookPdf(MemoryExport $export): string
    {
        $user = $export->user;
        $isRtl = $export->locale === 'ar';

        // Query authorized journal entries
        $query = JournalEntry::with(['blocks', 'media', 'owner'])
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('shares', function ($sq) use ($user) {
                        $sq->where('target_user_id', $user->id)
                            ->whereNull('revoked_at');
                    });
            });

        if ($export->date_from) {
            $query->where('entry_date', '>=', $export->date_from);
        }
        if ($export->date_to) {
            $query->where('entry_date', '<=', $export->date_to);
        }

        $entries = $query->orderBy('entry_date')->get();

        // Query events
        $eventsQuery = Event::where('user_id', $user->id);
        if ($export->date_from) {
            $eventsQuery->where('event_date', '>=', $export->date_from);
        }
        if ($export->date_to) {
            $eventsQuery->where('event_date', '<=', $export->date_to);
        }
        $events = $eventsQuery->orderBy('event_date')->get();

        // Render HTML book content
        $html = view('exports.memory_book', [
            'export' => $export,
            'user' => $user,
            'entries' => $entries,
            'events' => $events,
            'isRtl' => $isRtl,
        ])->render();

        $fileName = "exports/{$user->id}/export_{$export->id}.html";
        Storage::disk('local')->put($fileName, $html);

        $export->update([
            'status' => 'completed',
            'file_path' => $fileName,
            'file_size_bytes' => strlen($html),
        ]);

        return $fileName;
    }
}
