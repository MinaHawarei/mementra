# Media Ownership & Shared Access Model

## 1. Principles of Independent Ownership

In Mementra:
1. **Original Uploader is the File Owner**:
   - `memory_media.user_id` records the original author/uploader.
   - `memory_media.storage_connection_id` records the specific storage connection used for the file.
   - A shared journal entry can contain media owned by different contributors.
2. **Partners Have Authorized Shared Access**:
   - When User A shares a memory with User B, User B can view and download the media via Mementra according to sharing permissions.
   - User B cannot delete or modify User A's original file.
3. **Independent "Save to My Drive" Copies**:
   - Authorized partners can copy media to their own personal Google Drive.
   - The resulting file in User B's Drive is an independent physical file, not a Google Drive shortcut.
   - The copy is tracked in the `saved_media` table.
   - If User A later deletes their original memory or disconnects Google Drive, User B's saved copy remains available.

---

## 2. Shared Memory Structure Example

```
Shared Memory #100 ("Trip to Kyoto")
│
├── Photo 1 ("Temple in the morning.jpg")
│   ├── Owner: User A (Partner 1)
│   ├── Storage Connection: User A's Google Drive
│   └── Drive Location: User A's Drive: Mementra/Memories/2026/Memory_100/...
│
├── Photo 2 ("Bamboo forest walk.jpg")
│   ├── Owner: User B (Partner 2)
│   ├── Storage Connection: User B's Google Drive
│   └── Drive Location: User B's Drive: Mementra/Memories/2026/Memory_100/...
│
└── Saved Copy of Photo 1 ("Temple in the morning.jpg")
    ├── Saved By: User B (Partner 2)
    ├── Storage Connection: User B's Google Drive
    ├── Drive Location: User B's Drive: Mementra/Saved Memories/...
    └── Record: saved_media #12
```

---

## 3. Database Schema Overview

### `memory_media`
Tracks original uploaded media assets.
- `id`: Primary key
- `user_id`: Uploader / original owner (FK -> users)
- `journal_entry_id`: Associated memory (nullable, FK -> journal_entries)
- `storage_connection_id`: Active storage connection used (FK -> storage_connections)
- `storage_provider`: Driver name (`google_drive` or `local`)
- `provider_file_id`: Google Drive File ID or disk path
- `original_filename`: Original file name
- `mime_type`: Mime type
- `size_bytes`: File size
- `width`, `height`: Image dimensions (if photo)
- `metadata`: JSON payload

### `saved_media`
Tracks independent cross-account copies saved by partners.
- `id`: Primary key
- `user_id`: User who saved the copy (FK -> users)
- `original_media_id`: Reference to original media (FK -> memory_media, nullable on delete)
- `original_owner_id`: Original author (FK -> users)
- `storage_connection_id`: Saver's Google Drive connection (FK -> storage_connections)
- `provider`: Storage provider (`google_drive`)
- `provider_file_id`: Independent Google Drive File ID in saver's Drive
- `original_filename`: Filename
- `mime_type`: Mime type
- `size_bytes`: File size
- `saved_at`: Timestamp copy was made

