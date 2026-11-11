# Google Cloud Console & OAuth Setup Guide

## 1. Google Cloud Console Setup

To enable personal Google Drive connections in Mementra, set up a Google Cloud Project with the Drive API enabled.

### Step 1: Create or Select a Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown and select **New Project**.
3. Name the project `Mementra` and click **Create**.

### Step 2: Enable the Google Drive API
1. In the left navigation, go to **APIs & Services** > **Library** ([Direct link](https://console.cloud.google.com/apis/library/drive.googleapis.com)).
2. Search for **Google Drive API**.
3. Click **Enable**.

### Step 3: Configure the OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen** ([Direct link](https://console.cloud.google.com/apis/credentials/consent)).
2. Select User Type:
   - **External**: For general users.
3. Fill in App Information:
   - **App name**: `Mementra`
   - **User support email**: your contact email.
   - **Developer contact information**: your contact email.
4. Click **Save and Continue**.
5. Add Scopes:
   - Click **Add or Remove Scopes**.
   - Search for `https://www.googleapis.com/auth/drive.file`.
   - Select it along with `userinfo.email` and `userinfo.profile`.
   - Click **Update** > **Save and Continue**.
6. Test Users (Development/Testing):
   - Add your test Google accounts to the **Test users** list.
   - While the app is in "Testing" mode, only accounts listed here can authorize.

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Application Type: **Web application**.
4. Name: `Mementra Web Client`.
5. Authorized JavaScript origins:
   - `http://localhost:8000` (development)
   - `https://mementra.test` (local Herd / Valet)
   - `https://your-domain.com` (production)
6. Authorized redirect URIs:
   - Unified Sign-In / Sign-Up:
     - `http://localhost:8000/auth/google/callback`
     - `https://mementra.test/auth/google/callback`
     - `https://your-domain.com/auth/google/callback`
   - Standalone Settings Integration:
     - `http://localhost:8000/integrations/google-drive/callback`
     - `https://mementra.test/integrations/google-drive/callback`
     - `https://your-domain.com/integrations/google-drive/callback`
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.

---

## 2. Environment Variables (`.env`)

Add the following keys to your `.env` file:

```env
# Google OAuth & Drive Personal Cloud Storage Integration
GOOGLE_DRIVE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_AUTH_REDIRECT_URI="${APP_URL}/auth/google/callback"
GOOGLE_DRIVE_REDIRECT_URI="${APP_URL}/integrations/google-drive/callback"
```

Verify in `config/services.php`:
```php
'google_drive' => [
    'client_id' => env('GOOGLE_DRIVE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_DRIVE_CLIENT_SECRET'),
    'redirect_uri' => env('GOOGLE_DRIVE_REDIRECT_URI') ?: (env('APP_URL') ? rtrim((string) env('APP_URL'), '/').'/integrations/google-drive/callback' : null),
    'auth_redirect_uri' => env('GOOGLE_AUTH_REDIRECT_URI') ?: (env('APP_URL') ? rtrim((string) env('APP_URL'), '/').'/auth/google/callback' : null),
    'folder_id' => env('GOOGLE_DRIVE_FOLDER_ID'),
],
```

---

## 3. Production Verification & Publishing

Before launching to general public users outside your test list:
1. Submit your OAuth consent screen for verification in the Google Cloud Console.
2. Provide a privacy policy URL and terms of service URL.
3. Record a short demo video showing how Mementra requests Drive permissions and creates files in the user's Drive.

