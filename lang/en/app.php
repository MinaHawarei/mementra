<?php

return [
    // Navigation
    'nav' => [
        'dashboard' => 'Dashboard',
        'journal' => 'Journal',
        'memories' => 'Memories',
        'timeline' => 'Timeline',
        'events' => 'Events',
        'reminders' => 'Reminders',
        'relationship' => 'Relationship',
        'exports' => 'Exports',
        'settings' => 'Settings',
        'profile' => 'Profile',
        'logout' => 'Log Out',
    ],

    // Dashboard
    'dashboard' => [
        'title' => 'Dashboard',
        'welcome' => 'Welcome back, :name',
        'recent_entries' => 'Recent Journal Entries',
        'upcoming_events' => 'Upcoming Events',
        'upcoming_reminders' => 'Upcoming Reminders',
        'no_entries' => 'No journal entries yet. Start writing your first memory!',
        'no_events' => 'No upcoming events.',
        'no_reminders' => 'No upcoming reminders.',
        'create_entry' => 'New Entry',
        'view_all' => 'View All',
    ],

    // Journal
    'journal' => [
        'title' => 'Journal',
        'new_entry' => 'New Entry',
        'edit_entry' => 'Edit Entry',
        'entry_title' => 'Title',
        'entry_date' => 'Date',
        'entry_body' => 'Write your memory...',
        'private' => 'Private',
        'save' => 'Save',
        'update' => 'Update',
        'delete' => 'Delete',
        'delete_confirm' => 'Are you sure you want to delete this entry?',
        'no_entries' => 'No journal entries yet.',
        'remember_this' => 'Remember This',
        'share' => 'Share',
        'add_block' => 'Add Block',
        'text_block' => 'Text',
        'image_block' => 'Image',
        'add_photos' => 'Add Photos',
        'written_by' => 'Written by :name',
    ],

    // Memories / Gallery
    'memories' => [
        'title' => 'Memories',
        'no_memories' => 'No memories yet. Upload photos to your journal entries!',
        'filter_by_date' => 'Filter by date',
    ],

    // Timeline
    'timeline' => [
        'title' => 'Timeline',
        'no_items' => 'Your timeline is empty. Create journal entries and events to see them here.',
    ],

    // Events
    'events' => [
        'title' => 'Events & Milestones',
        'new_event' => 'New Event',
        'event_title' => 'Title',
        'event_date' => 'Date',
        'description' => 'Description',
        'recurrence' => 'Recurrence',
        'save' => 'Save',
        'delete' => 'Delete',
        'no_events' => 'No events yet.',
        'delete_confirm' => 'Are you sure you want to delete this event?',
    ],

    // Reminders
    'reminders' => [
        'title' => 'Reminders',
        'new_reminder' => 'New Reminder',
        'reminder_title' => 'Title',
        'remind_at' => 'Remind At',
        'recurrence' => 'Recurrence',
        'save' => 'Save',
        'delete' => 'Delete',
        'no_reminders' => 'No reminders set.',
        'active' => 'Active',
        'inactive' => 'Inactive',
    ],

    // Relationship
    'relationship' => [
        'title' => 'Relationship',
        'connect' => 'Connect with Someone',
        'partner_email' => 'Partner Email',
        'send_invitation' => 'Send Invitation',
        'pending' => 'Pending',
        'active' => 'Active',
        'ended' => 'Ended',
        'accept' => 'Accept',
        'decline' => 'Decline',
        'end_relationship' => 'End Relationship',
        'end_confirm' => 'Are you sure? Your memories will be preserved, but shared access will be revoked.',
        'no_relationship' => 'You are not connected with anyone yet.',
        'connected_with' => 'Connected with :name',
    ],

    // Sharing
    'sharing' => [
        'share_memory' => 'Share Memory',
        'share_with' => 'Share with',
        'permission' => 'Permission',
        'view_only' => 'View Only',
        'collaborate' => 'Collaborate',
        'start_date' => 'Start Date',
        'end_date' => 'End Date',
        'open_ended' => 'Open-ended',
        'revoke' => 'Revoke Access',
        'revoke_confirm' => 'Are you sure you want to revoke this share?',
        'shared_with' => 'Shared with :name',
    ],

    // Exports
    'exports' => [
        'title' => 'Memory Book Exports',
        'generate' => 'Generate Memory Book',
        'date_from' => 'From Date',
        'date_to' => 'To Date',
        'language' => 'Language',
        'include_photos' => 'Include Photos',
        'include_events' => 'Include Events',
        'processing' => 'Processing...',
        'completed' => 'Completed',
        'failed' => 'Failed',
        'expired' => 'Expired',
        'download' => 'Download',
        'no_exports' => 'No exports yet.',
    ],

    // Settings
    'settings' => [
        'title' => 'Settings',
        'description' => 'Manage your profile, security settings, appearance, and connected integrations.',
        'language' => 'Language',
        'timezone' => 'Timezone',
        'save' => 'Save Settings',
        'saved' => 'Settings saved successfully.',
        'nav' => [
            'profile' => 'Profile',
            'profile_desc' => 'Account info and preferences',
            'security' => 'Security',
            'security_desc' => 'Password, 2FA and passkeys',
            'appearance' => 'Appearance',
            'appearance_desc' => 'Theme and display options',
            'integrations' => 'Integrations',
            'integrations_desc' => 'Google Drive and cloud storage',
        ],
    ],

    // Integrations
    'integrations' => [
        'title' => 'Integrations',
        'description' => 'Connect external services to extend your Mementra experience.',
        'google_drive' => [
            'name' => 'Google Drive',
            'category' => 'Cloud Storage',
            'description' => 'Store personal memories and high-resolution media directly in your own Google Drive storage.',
            'connected' => 'Connected',
            'disconnected' => 'Not Connected',
            'error' => 'Connection Error',
            'reauth_required' => 'Reauthorization Required',
            'account' => 'Connected Account',
            'connected_since' => 'Connected Since',
            'last_verified' => 'Last Verified',
            'storage_folder' => 'Storage Location',
            'storage_folder_value' => 'Dedicated Mementra Vault Folder',
            'connect' => 'Connect Google Drive',
            'reconnect' => 'Reconnect',
            'test' => 'Test Connection',
            'testing' => 'Testing...',
            'disconnect' => 'Disconnect',
            'disconnecting' => 'Disconnecting...',
            'disconnect_title' => 'Disconnect Google Drive?',
            'disconnect_confirm' => 'Disconnecting will stop syncing new memories and media to your Google Drive account. Your existing files in Google Drive will not be deleted, and all Mementra memory entries remain intact.',
            'disconnect_cancel' => 'Cancel',
            'disconnect_action' => 'Yes, Disconnect',
            'features' => [
                'private' => 'Private by default — files remain entirely in your personal Google account',
                'no_central_storage' => 'Zero central lock-in — Mementra stores only metadata and journal logs',
                'partner_copy' => 'Independent copies — your partner can save memory copies to their own Drive',
            ],
            'error_title' => 'Session or Token Expired',
            'error_description' => 'Google Drive access token requires reauthorization to continue synchronizing your memories.',
            'retry' => 'Reconnect Google Drive',
        ],
        'upcoming' => [
            'title' => 'Upcoming Integrations',
            'subtitle' => 'Additional cloud storage and calendar integrations coming soon.',
            'dropbox' => 'Dropbox',
            'dropbox_desc' => 'Backup and synchronize your memories with your personal Dropbox account.',
            'icloud' => 'Apple iCloud',
            'icloud_desc' => 'Store and access photo memories seamlessly across your Apple devices.',
            'google_calendar' => 'Google Calendar',
            'google_calendar_desc' => 'Sync relationship anniversaries, milestones, and shared reminders.',
            'coming_soon' => 'Coming Soon',
        ],
    ],

    // Auth
    'auth' => [
        'login' => 'Log In',
        'register' => 'Register',
        'email' => 'Email',
        'password' => 'Password',
        'confirm_password' => 'Confirm Password',
        'name' => 'Name',
        'forgot_password' => 'Forgot Password?',
        'remember_me' => 'Remember me',
        'no_account' => "Don't have an account?",
        'has_account' => 'Already have an account?',
    ],

    // Common
    'common' => [
        'save' => 'Save',
        'cancel' => 'Cancel',
        'delete' => 'Delete',
        'edit' => 'Edit',
        'create' => 'Create',
        'back' => 'Back',
        'loading' => 'Loading...',
        'error' => 'An error occurred.',
        'success' => 'Success!',
        'confirm' => 'Confirm',
        'search' => 'Search...',
        'no_results' => 'No results found.',
        'yes' => 'Yes',
        'no' => 'No',
    ],

    // Recurrence options
    'recurrence' => [
        'none' => 'None',
        'daily' => 'Daily',
        'weekly' => 'Weekly',
        'monthly' => 'Monthly',
        'yearly' => 'Yearly',
    ],
];
