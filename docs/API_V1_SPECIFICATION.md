# Mementra — API v1 Specification & Mobile Integration Guide

## 1. Authentication Flow
- **Base Endpoint**: `/api/v1`
- **Authentication**: Laravel Fortify session-based or Bearer Sanctum tokens.
- **Headers**:
  ```http
  Accept: application/json
  Content-Type: application/json
  Authorization: Bearer <sanctum_token>
  ```

## 2. API Versioning Policy
- All REST API endpoints are prefixed with `/api/v1/`.
- Breaking changes require a new version path (`/api/v2/`).

## 3. Core Endpoints
- `GET /api/v1/me`: Returns authenticated user profile, locale, and timezone.
- `GET /api/v1/journal`: List user's journal entries (supports `?page=1`).
- `POST /api/v1/journal`: Create journal entry.
- `GET /api/v1/journal/{id}`: Show entry with blocks and media.
- `PUT /api/v1/journal/{id}`: Update entry.
- `DELETE /api/v1/journal/{id}`: Soft delete entry.
- `POST /api/v1/journal/{id}/shares`: Share entry with connected user.
- `DELETE /api/v1/shares/{id}`: Revoke share.
- `GET /api/v1/timeline`: Paginated timeline items sorted chronologically.
- `GET /api/v1/events`: List user's events & milestones.
- `GET /api/v1/reminders`: List active reminders.

## 4. Media Upload Flow
- Multipart upload endpoint: `POST /journal` with `images[]` field.
- Server validates file type (`image/*`), extracts width/height metadata, stores in secure media storage (Google Drive / S3), and streams via server-authorized `GET /media/{id}/file`.

## 5. Pagination & Response Formats
Standard JSON resource response format:
```json
{
  "data": [ ... ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 5, "per_page": 15, "total": 75 }
}
```

## 6. Error & Validation Formats
Validation failure (HTTP 422):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

## 7. Date & Timezone Handling
- All dates (`entry_date`, `event_date`) are stored in `YYYY-MM-DD` ISO format.
- Timestamps (`created_at`, `starts_at`, `ends_at`) are ISO-8601 strings (`2026-08-07T23:00:00Z`).
- Each user profile contains a `timezone` preference (e.g. `UTC`, `Asia/Riyadh`).

## 8. Push Notification Token Architecture
- Mobile clients register APNs / FCM push tokens via `POST /api/v1/devices/push-token`.
- Backend queues notifications via `PushChannelInterface` abstraction.
