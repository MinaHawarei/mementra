<?php

return [
    // Navigation
    'nav' => [
        'dashboard' => 'لوحة التحكم',
        'journal' => 'اليوميات',
        'memories' => 'الذكريات',
        'timeline' => 'الجدول الزمني',
        'events' => 'الأحداث',
        'reminders' => 'التذكيرات',
        'relationship' => 'العلاقة',
        'exports' => 'التصدير',
        'settings' => 'الإعدادات',
        'profile' => 'الملف الشخصي',
        'logout' => 'تسجيل الخروج',
    ],

    // Dashboard
    'dashboard' => [
        'title' => 'لوحة التحكم',
        'welcome' => 'مرحباً بعودتك، :name',
        'recent_entries' => 'آخر المدخلات',
        'upcoming_events' => 'الأحداث القادمة',
        'upcoming_reminders' => 'التذكيرات القادمة',
        'no_entries' => 'لا توجد مدخلات بعد. ابدأ بكتابة أول ذكرى!',
        'no_events' => 'لا توجد أحداث قادمة.',
        'no_reminders' => 'لا توجد تذكيرات قادمة.',
        'create_entry' => 'مدخل جديد',
        'view_all' => 'عرض الكل',
    ],

    // Journal
    'journal' => [
        'title' => 'اليوميات',
        'new_entry' => 'مدخل جديد',
        'edit_entry' => 'تعديل المدخل',
        'entry_title' => 'العنوان',
        'entry_date' => 'التاريخ',
        'entry_body' => 'اكتب ذكراك...',
        'private' => 'خاص',
        'save' => 'حفظ',
        'update' => 'تحديث',
        'delete' => 'حذف',
        'delete_confirm' => 'هل أنت متأكد أنك تريد حذف هذا المدخل؟',
        'no_entries' => 'لا توجد مدخلات بعد.',
        'remember_this' => 'تذكّر هذا',
        'share' => 'مشاركة',
        'add_block' => 'إضافة كتلة',
        'text_block' => 'نص',
        'image_block' => 'صورة',
        'add_photos' => 'إضافة صور',
        'written_by' => 'كُتب بواسطة :name',
    ],

    // Memories / Gallery
    'memories' => [
        'title' => 'الذكريات',
        'no_memories' => 'لا توجد ذكريات بعد. أضف صوراً إلى مدخلاتك!',
        'filter_by_date' => 'تصفية حسب التاريخ',
    ],

    // Timeline
    'timeline' => [
        'title' => 'الجدول الزمني',
        'no_items' => 'جدولك الزمني فارغ. أنشئ مدخلات وأحداث لتظهر هنا.',
    ],

    // Events
    'events' => [
        'title' => 'الأحداث والمعالم',
        'new_event' => 'حدث جديد',
        'event_title' => 'العنوان',
        'event_date' => 'التاريخ',
        'description' => 'الوصف',
        'recurrence' => 'التكرار',
        'save' => 'حفظ',
        'delete' => 'حذف',
        'no_events' => 'لا توجد أحداث بعد.',
        'delete_confirm' => 'هل أنت متأكد أنك تريد حذف هذا الحدث؟',
    ],

    // Reminders
    'reminders' => [
        'title' => 'التذكيرات',
        'new_reminder' => 'تذكير جديد',
        'reminder_title' => 'العنوان',
        'remind_at' => 'وقت التذكير',
        'recurrence' => 'التكرار',
        'save' => 'حفظ',
        'delete' => 'حذف',
        'no_reminders' => 'لا توجد تذكيرات.',
        'active' => 'نشط',
        'inactive' => 'غير نشط',
    ],

    // Relationship
    'relationship' => [
        'title' => 'العلاقة',
        'connect' => 'التواصل مع شخص',
        'partner_email' => 'البريد الإلكتروني للشريك',
        'send_invitation' => 'إرسال دعوة',
        'pending' => 'في الانتظار',
        'active' => 'نشطة',
        'ended' => 'انتهت',
        'accept' => 'قبول',
        'decline' => 'رفض',
        'end_relationship' => 'إنهاء العلاقة',
        'end_confirm' => 'هل أنت متأكد؟ ستبقى ذكرياتك محفوظة، لكن الوصول المشترك سيتم إلغاؤه.',
        'no_relationship' => 'لم تتصل بأي شخص بعد.',
        'connected_with' => 'متصل مع :name',
    ],

    // Sharing
    'sharing' => [
        'share_memory' => 'مشاركة الذكرى',
        'share_with' => 'مشاركة مع',
        'permission' => 'الصلاحية',
        'view_only' => 'عرض فقط',
        'collaborate' => 'تعاون',
        'start_date' => 'تاريخ البدء',
        'end_date' => 'تاريخ الانتهاء',
        'open_ended' => 'مفتوح المدة',
        'revoke' => 'إلغاء الوصول',
        'revoke_confirm' => 'هل أنت متأكد أنك تريد إلغاء هذه المشاركة؟',
        'shared_with' => 'مشترك مع :name',
    ],

    // Exports
    'exports' => [
        'title' => 'تصدير كتاب الذكريات',
        'generate' => 'إنشاء كتاب الذكريات',
        'date_from' => 'من تاريخ',
        'date_to' => 'إلى تاريخ',
        'language' => 'اللغة',
        'include_photos' => 'تضمين الصور',
        'include_events' => 'تضمين الأحداث',
        'processing' => 'جاري المعالجة...',
        'completed' => 'مكتمل',
        'failed' => 'فشل',
        'expired' => 'منتهي الصلاحية',
        'download' => 'تحميل',
        'no_exports' => 'لا توجد تصديرات بعد.',
    ],

    // Settings
    'settings' => [
        'title' => 'الإعدادات',
        'language' => 'اللغة',
        'timezone' => 'المنطقة الزمنية',
        'save' => 'حفظ الإعدادات',
        'saved' => 'تم حفظ الإعدادات بنجاح.',
    ],

    // Auth
    'auth' => [
        'login' => 'تسجيل الدخول',
        'register' => 'إنشاء حساب',
        'email' => 'البريد الإلكتروني',
        'password' => 'كلمة المرور',
        'confirm_password' => 'تأكيد كلمة المرور',
        'name' => 'الاسم',
        'forgot_password' => 'نسيت كلمة المرور؟',
        'remember_me' => 'تذكرني',
        'no_account' => 'ليس لديك حساب؟',
        'has_account' => 'لديك حساب بالفعل؟',
    ],

    // Common
    'common' => [
        'save' => 'حفظ',
        'cancel' => 'إلغاء',
        'delete' => 'حذف',
        'edit' => 'تعديل',
        'create' => 'إنشاء',
        'back' => 'رجوع',
        'loading' => 'جاري التحميل...',
        'error' => 'حدث خطأ.',
        'success' => 'تم بنجاح!',
        'confirm' => 'تأكيد',
        'search' => 'بحث...',
        'no_results' => 'لا توجد نتائج.',
        'yes' => 'نعم',
        'no' => 'لا',
    ],

    // Recurrence options
    'recurrence' => [
        'none' => 'بدون تكرار',
        'daily' => 'يومي',
        'weekly' => 'أسبوعي',
        'monthly' => 'شهري',
        'yearly' => 'سنوي',
    ],
];
