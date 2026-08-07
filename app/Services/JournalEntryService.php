<?php

namespace App\Services;

use App\Enums\BlockType;
use App\Models\JournalEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class JournalEntryService
{
    public function __construct(protected MediaService $mediaService) {}

    public function createEntry(User $user, array $data): JournalEntry
    {
        return DB::transaction(function () use ($user, $data) {
            $entry = JournalEntry::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'entry_date' => $data['entry_date'] ?? now()->toDateString(),
                'timezone' => $data['timezone'] ?? $user->timezone ?? 'UTC',
                'location_name' => $data['location_name'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'mood' => $data['mood'] ?? null,
                'is_private' => $data['is_private'] ?? false,
                'status' => $data['status'] ?? 'published',
            ]);

            $entry->contributors()->attach($user->id, ['role' => 'owner']);

            if (! empty($data['blocks']) && is_array($data['blocks'])) {
                foreach ($data['blocks'] as $index => $blockData) {
                    $entry->blocks()->create([
                        'type' => $blockData['type'] ?? BlockType::Text->value,
                        'position' => $index,
                        'content_json' => $blockData['content_json'] ?? null,
                        'created_by' => $user->id,
                    ]);
                }
            }

            if (! empty($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $imageFile) {
                    if ($imageFile instanceof UploadedFile) {
                        $this->mediaService->uploadMedia($user, $imageFile, $entry->id);
                    }
                }
            }

            return $entry->load(['blocks', 'media', 'contributors']);
        });
    }

    public function updateEntry(JournalEntry $entry, array $data): JournalEntry
    {
        return DB::transaction(function () use ($entry, $data) {
            $entry->update(array_filter([
                'title' => $data['title'] ?? null,
                'entry_date' => $data['entry_date'] ?? null,
                'timezone' => $data['timezone'] ?? null,
                'location_name' => $data['location_name'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'mood' => $data['mood'] ?? null,
                'is_private' => $data['is_private'] ?? null,
                'status' => $data['status'] ?? null,
            ], fn ($value) => $value !== null));

            if (isset($data['blocks']) && is_array($data['blocks'])) {
                $entry->blocks()->delete();
                foreach ($data['blocks'] as $index => $blockData) {
                    $entry->blocks()->create([
                        'type' => $blockData['type'] ?? BlockType::Text->value,
                        'position' => $index,
                        'content_json' => $blockData['content_json'] ?? null,
                        'created_by' => $blockData['created_by'] ?? $entry->user_id,
                    ]);
                }
            }

            if (! empty($data['images']) && is_array($data['images'])) {
                foreach ($data['images'] as $imageFile) {
                    if ($imageFile instanceof UploadedFile) {
                        $this->mediaService->uploadMedia($entry->owner, $imageFile, $entry->id);
                    }
                }
            }

            return $entry->fresh(['blocks', 'media', 'contributors']);
        });
    }

    public function deleteEntry(JournalEntry $entry): bool
    {
        return DB::transaction(function () use ($entry) {
            $entry->blocks()->delete();

            return $entry->delete();
        });
    }

    public function getUserEntries(User $user): Collection
    {
        return JournalEntry::with(['blocks', 'media'])
            ->where('user_id', $user->id)
            ->orderByDesc('entry_date')
            ->get();
    }
}
