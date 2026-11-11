# Security & Privacy Considerations

## 1. Security Architecture

Mementra is designed with defense-in-depth principles for all media and cloud storage operations:

### A. OAuth Security & Anti-CSRF Protection
- **Unique State Tokens**: Every OAuth initiation generates an unguessable cryptographic token tied to the user's session and stored in `Session::put("google_drive_oauth_state_{$user->id}", $stateToken)`.
- **State Validation**: On callback, the state parameter is verified against the authenticated user and session using `hash_equals()`.
- **Offline Refresh Token Protection**: `access_type=offline` and `prompt=consent` ensure refresh tokens are obtained securely.

### B. Encryption at Rest
- Tokens (`access_token`, `refresh_token`) are encrypted in MySQL using AES-256-CBC via Laravel's `encrypted` model cast.
- The encryption key is sourced from `APP_KEY` in `.env`.
- Database dumps or read-only database compromises cannot reveal plain-text OAuth tokens without the application key.

### C. Zero Token Exposure to Frontend
- OAuth tokens, refresh tokens, and internal Google Drive folder paths are strictly server-side.
- Tokens are never passed in Inertia props, API responses, HTML meta tags, or JavaScript state.

### D. Private Media & Backend Authorization
- Media files in Google Drive are **not** made public (`anyoneWithLink` permissions are never requested).
- Direct Google Drive URLs are never exposed to browser clients.
- Every media request (`GET /media/{media}/file`, `GET /media/{media}/download`) passes through Laravel's `auth` and `verified` middleware.
- `MemoryMediaPolicy` verifies:
  1. The user owns the media, OR
  2. The media belongs to a journal entry that is shared with the user through direct user share or active relationship share, and the share is currently active (not revoked, within start/end dates).
- Unauthorized requests return HTTP 403 Forbidden without leaking file IDs, metadata, or ownership information.

---

## 2. Privacy & Data Boundaries

### What Mementra Can and Cannot Access
- **Least Privilege Scope (`drive.file`)**: Mementra can only access files and folders that the Mementra application itself created. It has zero access to the user's personal Google Docs, Sheets, Gmail, Photos, or other Drive folders.
- **Data Integrity**: When a user disconnects their Drive, Mementra invalidates the tokens, stops all synchronization, and never deletes files from Google Drive.

### Important Note on End-to-End Encryption
Google Drive personal storage does **not** provide client-side end-to-end encryption (E2EE). The Mementra backend server processes media binaries as a trusted proxy when streaming files between authorized users. The architecture has been structured with DTOs and provider interfaces so that client-side encryption (Web Crypto API / envelope encryption) can be integrated in future phases without rewriting the underlying storage abstractions.

