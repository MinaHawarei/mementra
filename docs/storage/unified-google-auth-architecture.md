# Mementra — Unified Google OAuth & Automatic Google Drive Connection

## 1. Overview & Architectural Vision

Mementra pairs Google identity authentication with personal Google Drive cloud storage. When users authenticate using Google, Mementra unifies authentication and storage provisioning into a single, cohesive user experience while maintaining security boundaries and user consent choice.

### Core Principles

1. **Independent Per-User Cloud Storage:** Every user connects their own personal Google Drive account. Media is never stored in a shared or developer-owned bucket.
2. **Unified Onboarding:** Users who sign in or sign up with Google have their Google Drive storage connected and folder hierarchy provisioned automatically without needing a secondary manual connection step.
3. **Decoupled Identity vs. Storage Permissions:** Google identity (`openid`, `email`, `profile`) and Google Drive permissions (`https://www.googleapis.com/auth/drive.file`) are evaluated independently. If a user declines Drive storage access, authentication still succeeds without disruption.
4. **Account Takeover Prevention:** Account linking for existing email/password accounts requires strict Google email verification (`email_verified === true`). Unverified Google accounts are rejected from merging.

---

## 2. Authorization Flows & Scenarios

### Scenario A: New User Sign Up with Google
```
User clicks "Continue with Google"
  │
  ▼
GET /auth/google/redirect
  │
  ▼
Redirect to Google OAuth Consent Screen
  ├─ Scopes: openid, userinfo.email, userinfo.profile, drive.file
  ├─ Access Type: offline
  ├─ Prompt: select_account consent
  └─ State: Cryptographically random token (CSRF protected)
  │
  ▼
User Approves Identity + Drive
  │
  ▼
GET /auth/google/callback?code=...&state=...
  ├─ Validate CSRF state
  ├─ Exchange code for access & refresh tokens
  ├─ Fetch profile (/oauth2/v3/userinfo)
  ├─ Create new User record (google_id, avatar, verified email)
  ├─ Establish Laravel session (Auth::login)
  ├─ Store StorageConnection (tokens encrypted at rest)
  ├─ Provision "Mementra" and "Saved Memories" folders
  └─ Redirect to /dashboard with success toast
```

### Scenario B: Existing User Sign In with Google
```
User clicks "Continue with Google"
  │
  ▼
Google OAuth Callback
  ├─ Match existing user by google_id
  ├─ Refresh profile avatar if updated
  ├─ Establish session (Auth::login)
  ├─ Check granted Drive scope
  │    ├─ If granted: Update tokens (preserving refresh token) & verify folders
  │    └─ If missing: Update connection status to ReauthorizationRequired
  └─ Redirect to /dashboard
```

### Scenario C: Existing Email/Password Account Linking
```
User with email user@example.com (registered via password) clicks "Continue with Google"
  │
  ▼
Google OAuth Callback
  ├─ Match existing user by email user@example.com
  ├─ Security Check: Is Google profile email_verified === true?
  │    ├─ FALSE: ABORT! Reject link, redirect to /login with security error.
  │    └─ TRUE: Safely link google_id and avatar to existing user.
  ├─ Establish session
  ├─ Establish or update Google Drive connection
  └─ Redirect to /dashboard with account linked confirmation
```

### Scenario D: User Declines Google Drive Permission
```
User Approves Identity but Unchecks/Declines Drive Scope on Google Consent Screen
  │
  ▼
Google OAuth Callback
  ├─ Token response returns granted scopes WITHOUT https://www.googleapis.com/auth/drive.file
  ├─ Authenticate user (user is logged in, not blocked)
  ├─ Record StorageConnection status as ReauthorizationRequired
  ├─ Do NOT attempt folder provisioning or file uploads
  └─ Redirect to /dashboard with warning toast & guide to Settings > Integrations
```

---

## 3. Scope Strategy & Least Privilege

Mementra adheres to the principle of least privilege:
- **Never request full Drive access** (`https://www.googleapis.com/auth/drive`).
- **Use `https://www.googleapis.com/auth/drive.file`**:
  - Grants access **only** to files and folders created or opened by Mementra.
  - Mementra **cannot** view, read, or modify any other files in the user's personal Google Drive.
  - Qualifies for faster Google Cloud verification review.

---

## 4. Key Endpoints

| Endpoint | Method | Middleware | Controller / Handler | Purpose |
|---|---|---|---|---|
| `/auth/google/redirect` | `GET` | `web` | `GoogleAuthController@redirect` | Initiates unified sign in / sign up |
| `/auth/google/callback` | `GET` | `web` | `GoogleAuthController@callback` | Handles Google OAuth response |
| `/settings/integrations` | `GET` | `auth` | `GoogleDriveIntegrationController@index` | Cloud storage management page |
| `/integrations/google-drive/redirect` | `GET` | `auth` | `GoogleDriveIntegrationController@redirect` | Standalone Drive connect |
| `/integrations/google-drive/callback` | `GET` | `auth` | `GoogleDriveIntegrationController@callback` | Standalone Drive callback |
| `/integrations/google-drive/disconnect` | `DELETE` | `auth` | `GoogleDriveIntegrationController@disconnect` | Disconnects Drive connection |
| `/integrations/google-drive/test` | `POST` | `auth` | `GoogleDriveIntegrationController@testConnection` | Live test connection & quota |

