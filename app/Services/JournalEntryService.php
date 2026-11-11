<?php

namespace App\Services;

use App\Enums\BlockType;
use App\Models\JournalEntry;
use App\Models\MemoryMedia;
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
                $this->syncBlocks($entry, $data['blocks'], $user);
            }

            if (! empty($data['images']) && is_array($data['images'])) {
                $this->attachImages($entry, $data['images'], $user);
            }

            return $entry->load(['blocks', 'media', 'contributors']);
        });
    }

    public function updateEntry(JournalEntry $entry, array $data, ?User $uploader = null): JournalEntry
    {
        return DB::transaction(function () use ($entry, $data, $uploader) {
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

            // Sync blocks if provided in data
            if (isset($data['blocks']) && is_array($data['blocks'])) {
                $creator = $uploader ?? $entry->owner;
                $this->syncBlocks($entry, $data['blocks'], $creator);
            }

            // Handle detaching media (preserves files in Google Drive and user gallery)
            $detachedIds = array_filter(array_merge(
                $data['detached_media_ids'] ?? [],
                $data['removed_media_ids'] ?? []
            ));

            if (! empty($detachedIds)) {
                MemoryMedia::whereIn('id', $detachedIds)
                    ->where('journal_entry_id', $entry->id)
                    ->update(['journal_entry_id' => null]);
            } elseif (isset($data['keep_media_ids']) && is_array($data['keep_media_ids'])) {
                MemoryMedia::where('journal_entry_id', $entry->id)
                    ->whereNotIn('id', $data['keep_media_ids'])
                    ->update(['journal_entry_id' => null]);
            }

            // Upload and attach new images with deduplication
            if (! empty($data['images']) && is_array($data['images'])) {
                $actualUploader = $uploader ?? $entry->owner;
                $this->attachImages($entry, $data['images'], $actualUploader);
            }

            return $entry->fresh(['blocks', 'media', 'contributors']);
        });
    }

    public function syncBlocks(JournalEntry $entry, array $blocks, User $creator): void
    {
        $normalizedBlocks = [];
        $seen = [];

        foreach ($blocks as $blockData) {
            if (! is_array($blockData)) {
                continue;
            }

            $type = $blockData['type'] ?? BlockType::Text->value;
            if ($type instanceof BlockType) {
                $type = $type->value;
            }

            $content = $blockData['content_json'] ?? $blockData['content'] ?? null;
            if (is_string($content)) {
                $decoded = json_decode($content, true);
                $content = is_array($decoded) ? $decoded : ['text' => $content];
            }

            // Skip completely empty text blocks
            if ($type === BlockType::Text->value && empty($content['text'] ?? null)) {
                if (empty(array_filter($content ?? []))) {
                    continue;
                }
            }

            // Deduplicate identical blocks in the same save
            $signature = $type.':'.json_encode($content);
            if (isset($seen[$signature])) {
                continue;
            }
            $seen[$signature] = true;

            $normalizedBlocks[] = [
                'type' => $type,
                'content_json' => $content,
                'created_by' => $blockData['created_by'] ?? $creator->id,
            ];
        }

        $entry->blocks()->delete();

        foreach ($normalizedBlocks as $index => $b) {
            $entry->blocks()->create([
                'type' => $b['type'],
                'position' => $index,
                'content_json' => $b['content_json'],
                'created_by' => $b['created_by'],
            ]);
        }
    }

    protected function attachImages(JournalEntry $entry, array $images, User $uploader): void
    {
        $currentlyAttached = $entry->media()->get();

        foreach ($images as $imageFile) {
            if ($imageFile instanceof UploadedFile) {
                $filename = $imageFile->getClientOriginalName();
                $fileSize = $imageFile->getSize();

                // Prevent duplicate attachments with identical filename & size for this entry
                $alreadyAttached = $currentlyAttached->contains(function ($m) use ($filename, $fileSize) {
                    return $m->original_filename === $filename && ($fileSize === null || $m->size_bytes === $fileSize);
                });

                if ($alreadyAttached) {
                    continue;
                }

                $uploaded = $this->mediaService->uploadMedia($uploader, $imageFile, $entry->id);
                $currentlyAttached->push($uploaded);
            }
        }
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
