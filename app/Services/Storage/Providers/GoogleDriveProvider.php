<?php

namespace App\Services\Storage\Providers;

use App\Contracts\Storage\StorageProviderInterface;
use App\Models\StorageConnection;
use App\Services\Storage\DTOs\StoredFile;
use App\Services\Storage\GoogleDriveOAuthService;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleDriveProvider implements StorageProviderInterface
{
    public function __construct(
        protected StorageConnection $connection,
        protected ?GoogleDriveOAuthService $oauthService = null
    ) {
        $this->oauthService ??= app(GoogleDriveOAuthService::class);
    }

    public function getConnection(): StorageConnection
    {
        return $this->connection;
    }

    public function upload(UploadedFile|string $file, array $options = []): StoredFile
    {
        $accessToken = $this->getValidAccessToken();

        if ($file instanceof UploadedFile) {
            $originalName = $options['filename'] ?? $file->getClientOriginalName();
            $mimeType = $options['mime_type'] ?? $file->getMimeType() ?? 'application/octet-stream';
            $sizeBytes = $file->getSize();
            $contents = file_get_contents($file->getRealPath());

            $width = null;
            $height = null;
            if (str_starts_with($mimeType, 'image/')) {
                $imageSize = @getimagesize($file->getRealPath());
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            }
        } else {
            $contents = $file;
            $originalName = $options['filename'] ?? 'file_'.Str::random(10).'.bin';
            $mimeType = $options['mime_type'] ?? 'application/octet-stream';
            $sizeBytes = strlen($contents);
            $width = $options['width'] ?? null;
            $height = $options['height'] ?? null;

            if ($width === null && str_starts_with($mimeType, 'image/')) {
                $imageSize = @getimagesizefromstring($contents);
                if ($imageSize) {
                    $width = $imageSize[0];
                    $height = $imageSize[1];
                }
            }
        }

        $folderId = $this->resolveFolderId($options);

        $metadata = [
            'name' => $originalName,
            'mimeType' => $mimeType,
        ];

        if ($folderId) {
            $metadata['parents'] = [$folderId];
        }

        $response = Http::withToken($accessToken)
            ->attach('metadata', json_encode($metadata), 'metadata.json', ['Content-Type' => 'application/json; charset=UTF-8'])
            ->attach('file', $contents, $originalName, ['Content-Type' => $mimeType])
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType,createdTime');

        if ($response->failed()) {
            Log::error('Google Drive file upload failed', [
                'connection_id' => $this->connection->id,
                'status' => $response->status(),
                'error' => $response->body(),
            ]);

            throw new Exception('Google Drive upload failed: '.$response->body());
        }

        $data = $response->json();

        return new StoredFile(
            fileId: $data['id'],
            provider: 'google_drive',
            originalFilename: $data['name'] ?? $originalName,
            mimeType: $data['mimeType'] ?? $mimeType,
            sizeBytes: (int) ($data['size'] ?? $sizeBytes),
            width: $width,
            height: $height,
            url: null,
            metadata: [
                'connection_id' => $this->connection->id,
                'folder_id' => $folderId,
                'google_drive_file_id' => $data['id'],
                'created_time' => $data['createdTime'] ?? null,
            ]
        );
    }

    public function download(string $fileId): string
    {
        $accessToken = $this->getValidAccessToken();

        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media");

        if ($response->failed()) {
            Log::error('Google Drive file download failed', [
                'connection_id' => $this->connection->id,
                'file_id' => $fileId,
                'status' => $response->status(),
            ]);

            throw new Exception("Failed to download file [{$fileId}] from Google Drive.");
        }

        return $response->body();
    }

    public function stream(string $fileId)
    {
        $content = $this->download($fileId);
        $stream = fopen('php://temp', 'r+');

        if ($stream === false) {
            throw new Exception('Failed to allocate temporary stream.');
        }

        fwrite($stream, $content);
        rewind($stream);

        return $stream;
    }

    public function copy(string $fileId, array $options = []): StoredFile
    {
        $accessToken = $this->getValidAccessToken();

        $targetFolderId = $this->resolveFolderId($options);

        $metadata = [];
        if (! empty($options['filename'])) {
            $metadata['name'] = $options['filename'];
        }

        if ($targetFolderId) {
            $metadata['parents'] = [$targetFolderId];
        }

        $response = Http::withToken($accessToken)
            ->post("https://www.googleapis.com/drive/v3/files/{$fileId}/copy?fields=id,name,size,mimeType,createdTime", $metadata);

        if ($response->failed()) {
            Log::error('Google Drive intra-account copy failed', [
                'connection_id' => $this->connection->id,
                'file_id' => $fileId,
                'status' => $response->status(),
                'error' => $response->body(),
            ]);

            throw new Exception("Failed to copy file [{$fileId}] in Google Drive.");
        }

        $data = $response->json();

        return new StoredFile(
            fileId: $data['id'],
            provider: 'google_drive',
            originalFilename: $data['name'] ?? ($options['filename'] ?? 'copied_file'),
            mimeType: $data['mimeType'] ?? 'application/octet-stream',
            sizeBytes: (int) ($data['size'] ?? 0),
            width: $options['width'] ?? null,
            height: $options['height'] ?? null,
            url: null,
            metadata: [
                'connection_id' => $this->connection->id,
                'folder_id' => $targetFolderId,
                'original_file_id' => $fileId,
            ]
        );
    }

    public function delete(string $fileId): bool
    {
        $accessToken = $this->getValidAccessToken();

        $response = Http::withToken($accessToken)
            ->delete("https://www.googleapis.com/drive/v3/files/{$fileId}");

        return $response->successful();
    }

    public function exists(string $fileId): bool
    {
        $metadata = $this->getMetadata($fileId);

        return ! empty($metadata);
    }

    public function getMetadata(string $fileId): array
    {
        $accessToken = $this->getValidAccessToken();

        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$fileId}?fields=id,name,size,mimeType,createdTime,trashed");

        if ($response->failed() || ($response->json('trashed') ?? false)) {
            return [];
        }

        return $response->json();
    }

    public function getTemporaryAccessUrl(string $fileId, int $expirationMinutes = 5): ?string
    {
        // Google Drive user files are kept strictly private; access is securely proxied through Laravel
        return null;
    }

    public function getValidAccessToken(): string
    {
        if ($this->connection->isTokenExpired() || ! $this->connection->access_token) {
            $refreshed = $this->oauthService->refreshToken($this->connection);
            if (! $refreshed) {
                throw new Exception('Google Drive access token has expired and reauthorization is required.');
            }
            $this->connection->refresh();
        }

        return (string) $this->connection->access_token;
    }

    protected function resolveFolderId(array $options): ?string
    {
        if (! empty($options['folder_id'])) {
            return $options['folder_id'];
        }

        $folderType = $options['folder_type'] ?? 'memories';

        if ($folderType === 'saved') {
            if ($this->connection->saved_folder_id) {
                return $this->connection->saved_folder_id;
            }

            // Create saved folder under root
            $rootId = $this->ensureRootFolder();
            $savedId = $this->oauthService->findOrCreateFolder($this->getValidAccessToken(), 'Saved Memories', $rootId);
            $this->connection->update(['saved_folder_id' => $savedId]);

            return $savedId;
        }

        // Default memory folder: Mementra/Memories/{Year}
        $rootId = $this->ensureRootFolder();
        $accessToken = $this->getValidAccessToken();

        $memoriesFolderId = $this->oauthService->findOrCreateFolder($accessToken, 'Memories', $rootId);

        $year = $options['year'] ?? date('Y');
        $yearFolderId = $this->oauthService->findOrCreateFolder($accessToken, (string) $year, $memoriesFolderId);

        if (! empty($options['memory_id'])) {
            $memoryFolderId = $this->oauthService->findOrCreateFolder(
                $accessToken,
                "Memory_{$options['memory_id']}",
                $yearFolderId
            );

            return $memoryFolderId;
        }

        return $yearFolderId;
    }

    protected function ensureRootFolder(): string
    {
        if ($this->connection->root_folder_id) {
            return $this->connection->root_folder_id;
        }

        $rootId = $this->oauthService->findOrCreateFolder(
            $this->getValidAccessToken(),
            'Mementra'
        );

        $this->connection->update(['root_folder_id' => $rootId]);

        return $rootId;
    }
}
