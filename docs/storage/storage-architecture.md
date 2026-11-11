# Mementra — Storage Architecture

## 1. Overview & Architectural Vision

Mementra is designed as a **personal memory management platform with decentralized user-owned cloud storage**.
Unlike traditional platforms that upload all user media into a centralized company storage bucket or centralized Google Drive account, Mementra establishes strict separation between:
1. **The Application Data & Social Graph Layer**: Stored in MySQL (memories, journal entries, blocks, relationships, shares, reminders, timelines, metadata).
2. **The Binary Media Layer**: Stored directly in each user's personal Google Drive account (or local private storage as a developer/offline fallback).

```
+-------------------------------------------------------------------------+
|                            MEMENTRA BACKEND                             |
|                                                                         |
|  +--------------------+     +-------------------+     +--------------+  |
|  | Journal / Memories |     | StorageManager    |     | Storage-     |  |
|  | Controllers        | --> | & MediaService    | --> | Resolver     |  |
|  +--------------------+     +-------------------+     +--------------+  |
|                                                              |          |
|                  +-------------------------------------------+          |
|                  |                                           |          |
|                  v                                           v          |
|     +-------------------------+                 +---------------------+ |
|     |   GoogleDriveProvider   |                 | LocalStorageProvider| |
|     |   (User OAuth Tokens)   |                 | (App Private Disk)  | |
|     +-------------------------+                 +---------------------+ |
+------------------|------------------------------------------------------+
                   |
                   v
      +-------------------------+
      | User's Own Google Drive |
      |  Mementra/Memories/...  |
      +-------------------------+
```

---

## 2. Core Principles

- **User Ownership**: Each user's original photos, videos, and keepsakes reside in their own personal Google Drive.
- **Privacy by Default**: Files stored in Google Drive are never made publicly accessible via shareable links.
- **Secure Backend Proxying**: All media requests from the frontend (`/media/{media}/file`) are authenticated and authorized by Laravel policies before media bytes are proxied to authorized clients.
- **Decoupled Architecture**: Media controllers and journal services interact with the storage abstraction (`StorageProviderInterface`, `StorageManager`), never raw Google API calls.
- **Independent Cross-Account Copies**: When User B saves a shared memory from User A to their own Drive ("Save to My Drive"), Mementra streams the original file from User A's authorized connection and writes an independent physical copy into User B's Google Drive. The copy survives if User A deletes their original or disconnects.

---

## 3. Storage Layer Components

### Contracts
- `App\Contracts\Storage\StorageProviderInterface`: Defines the unified contract:
  - `upload(UploadedFile|string $file, array $options = []): StoredFile`
  - `download(string $fileId): string`
  - `stream(string $fileId)`
  - `copy(string $fileId, array $options = []): StoredFile`
  - `delete(string $fileId): bool`
  - `exists(string $fileId): bool`
  - `getMetadata(string $fileId): array`
  - `getTemporaryAccessUrl(string $fileId, int $expirationMinutes = 5): ?string`

### DTOs
- `App\Services\Storage\DTOs\StoredFile`: Immutable value object carrying:
  - `fileId` (Google Drive ID or local path)
  - `provider` (`google_drive` or `local`)
  - `originalFilename`, `mimeType`, `sizeBytes`, `width`, `height`, `url`, `metadata`
- `App\Services\Storage\DTOs\UploadResult`: Backward-compatible result wrapper.

### Providers
- `App\Services\Storage\Providers\GoogleDriveProvider`:
  - Operates on a specific user's `StorageConnection`.
  - Uses Google Drive API v3 via HTTP client.
  - Automatically refreshes expired OAuth access tokens before execution.
  - Provisions and targets folders (`Mementra/Memories/{Year}/Memory_{id}` or `Mementra/Saved Memories`).
- `App\Services\Storage\Providers\LocalStorageProvider`:
  - Operates on Laravel `local` private disk (`storage_path('app/private')`).
  - Uses UUID prefixed filenames to eliminate collisions.
  - Used for testing, local development, and unlinked fallback.

### Services
- `App\Services\Storage\StorageResolver`:
  - Dynamically resolves the correct provider based on `StorageConnection`, `User`, `MemoryMedia`, or `SavedMedia`.
- `App\Services\Storage\StorageManager`:
  - Coordinates uploads, downloads, deletions, and cross-account copying between independent users.
- `App\Services\Storage\GoogleDriveOAuthService`:
  - Handles the OAuth 2.0 Web Server Flow, token refresh, folder provisioning, and state CSRF verification.
- `App\Services\MediaService`:
  - High-level domain service orchestrating database transactions, metadata extraction, and storage interactions.

