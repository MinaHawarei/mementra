<?php

namespace App\Services\Storage;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoogleDriveMediaStorage implements MediaStorageInterface
{
    protected ?string $clientId;

    protected ?string $clientSecret;

    protected ?string $refreshToken;

    protected ?string $folderId;

    public function __construct()
    {
        $this->clientId = config('services.google_drive.client_id');
        $this->clientSecret = config('services.google_drive.client_secret');
        $this->refreshToken = config('services.google_drive.refresh_token');
        $this->folderId = config('services.google_drive.folder_id');
    }

    public function upload(string $path, string $contents, string $mimeType, ?string $folder = null): StorageResult
    {
        $accessToken = $this->getAccessToken();

        $metadata = [
            'name' => basename($path),
            'mimeType' => $mimeType,
        ];

        $targetFolder = $folder ?? $this->folderId;
        if ($targetFolder) {
            $metadata['parents'] = [$targetFolder];
        }

        $response = Http::withToken($accessToken)
            ->attach('metadata', json_encode($metadata), 'metadata.json', ['Content-Type' => 'application/json; charset=UTF-8'])
            ->attach('file', $contents, basename($path), ['Content-Type' => $mimeType])
            ->post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType,webContentLink');

        if ($response->failed()) {
            Log::error('Google Drive upload failed', ['response' => $response->body()]);
            throw new Exception('Google Drive upload failed: '.$response->body());
        }

        $data = $response->json();

        return new StorageResult(
            fileId: $data['id'],
            provider: 'google_drive',
            url: $data['webContentLink'] ?? null,
            metadata: [
                'name' => $data['name'] ?? basename($path),
                'mime_type' => $data['mimeType'] ?? $mimeType,
                'size_bytes' => (int) ($data['size'] ?? strlen($contents)),
            ]
        );
    }

    public function download(string $fileId): string
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$fileId}?alt=media");

        if ($response->failed()) {
            throw new Exception('Failed to download file from Google Drive');
        }

        return $response->body();
    }

    public function delete(string $fileId): bool
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->delete("https://www.googleapis.com/drive/v3/files/{$fileId}");

        return $response->successful();
    }

    public function exists(string $fileId): bool
    {
        try {
            $metadata = $this->metadata($fileId);

            return ! empty($metadata);
        } catch (Exception) {
            return false;
        }
    }

    public function metadata(string $fileId): array
    {
        $accessToken = $this->getAccessToken();

        $response = Http::withToken($accessToken)
            ->get("https://www.googleapis.com/drive/v3/files/{$fileId}?fields=id,name,size,mimeType,createdTime");

        if ($response->failed()) {
            return [];
        }

        return $response->json();
    }

    protected function getAccessToken(): string
    {
        if (! $this->clientId || ! $this->clientSecret || ! $this->refreshToken) {
            throw new Exception('Google Drive OAuth credentials are missing in services configuration.');
        }

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $this->refreshToken,
            'grant_type' => 'refresh_token',
        ]);

        if ($response->failed()) {
            throw new Exception('Failed to obtain Google Drive access token: '.$response->body());
        }

        return $response->json('access_token');
    }
}
