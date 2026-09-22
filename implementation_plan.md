# Mementra — Complete UI/UX Overhaul & System Audit Plan

Full redesign based on the Mementra brand: deep navy/indigo, violet, warm orange/gold accent, premium + warm + elegant. Fixes the journal edit white screen, replaces the Laravel welcome page, establishes a proper design system, and performs a system-wide audit.

---

## User Review Required

> [!IMPORTANT]
> **Journal Edit White Screen Bug** — The root cause is **NOT** a PHP error. The `JournalController@edit` is clean. The white screen likely happens due to an **authorization failure (403)** when a non-owner tries to edit, or a React crash if `entry.blocks` arrives as `{ data: [...] }` instead of a plain array (Inertia resource collection wrapping). Fix is: normalize the block/media structure at the controller level before passing to Inertia.

> [!WARNING]
> **`fake()` in `UserFactory`** — The `UserFactory` uses `fake()` which fails under Laravel 13 in some environments. This must be fixed before running seeders or factory-based tests.

> [!IMPORTANT]
> **Light Mode Default** — Currently `initializeTheme()` defaults to `'system'`. This must change to `'light'` as the default. The `'system'` option can remain as a third choice in settings.

---

## Proposed Changes

### Phase 1 — Bug Fixes (Backend + Frontend)
- [x] [JournalController.php](file:///d:/projects/Mementra/app/Http/Controllers/Web/JournalController.php): Normalize `blocks` and `media` to plain arrays before Inertia render.
- [x] [UserFactory.php](file:///d:/projects/Mementra/database/factories/UserFactory.php): Replace `fake()` with `$this->faker`.
- [x] [app.tsx](file:///d:/projects/Mementra/resources/js/app.tsx): Change progress bar color from `#4B5563` to brand indigo `#6366f1`.
- [x] [app.blade.php](file:///d:/projects/Mementra/resources/views/app.blade.php): Set Mementra theme color `#4f46e5`, background colors, and dynamic dir="rtl"/"ltr".

---

### Phase 2 — Design System (Tailwind CSS Variables)
- [x] [app.css](file:///d:/projects/Mementra/resources/css/app.css): Establish Mementra palette (Deep Indigo primary, warm neutral bg, deep navy dark mode, warm gold/amber accent, and brand gradients).

---

### Phase 3 — Welcome Page (Brand Landing)
- [x] [welcome.tsx](file:///d:/projects/Mementra/resources/js/pages/welcome.tsx): Full replacement with premium Mementra landing page ("Preserve the moments that matter", features, brand gradients, elegant copy).

---

### Phase 4 — Layout & App Shell
- [x] [app-logo.tsx](file:///d:/projects/Mementra/resources/js/components/app-logo.tsx) & [app-logo-icon.tsx](file:///d:/projects/Mementra/resources/js/components/app-logo-icon.tsx): Update logo mark with brand indigo/violet and living memory styling.
- [x] [app-sidebar.tsx](file:///d:/projects/Mementra/resources/js/components/app-sidebar.tsx): Update sidebar navigation and active states with brand colors.
- [x] [app-sidebar-layout.tsx](file:///d:/projects/Mementra/resources/js/layouts/app/app-sidebar-layout.tsx): Support breadcrumbs and layout header.

---

### Phase 5 — Page Redesigns
- [x] Dashboard (`dashboard.tsx`): Hero greeting with gradient, stats counters, relationship status card, recent memories with mood badges, sidebar reminders.
- [x] Journal Index (`journal/index.tsx`): Grid of memory cards with mood color borders, filter/search bar, empty state.
- [x] Journal Show (`journal/show.tsx`): Elegant article layout, prose styling, sticky action bar, photo gallery with hover zoom, share & reminder panels.
- [x] Journal Create (`journal/create.tsx`): Mood picker emoji button grid, clean textarea, photo drag/upload, sticky action button.
- [x] Journal Edit (`journal/edit.tsx`): Consistent with Create, verified no white screen, existing media gallery.
- [x] Events, Reminders, Timeline, Relationship, Exports: Brand-consistent card and panel layouts.

---

### Phase 6 — Auth Pages
- [x] [auth-layout.tsx](file:///d:/projects/Mementra/resources/js/layouts/auth-layout.tsx): Implement split-screen brand gradient on left with tagline and clean form on right.
- [x] Auth forms (Login, Register, Forgot Password, Reset Password, Confirm Password, Verify Email): Brand styling with indigo focus rings.

---

### Phase 7 — Settings
- [x] Appearance Settings (`settings/appearance.tsx`): Theme switcher via AppearanceTabs icon-button group (Light/Dark/System) with brand-toned heading.
- [x] Profile Settings (`settings/profile.tsx`): Clean sections with dividers, styled language and timezone selects.

---

### Phase 8 — RTL / LTR Support
- [x] [app.tsx](file:///d:/projects/Mementra/resources/js/app.tsx): Set `document.documentElement.dir` and `lang` dynamically from user locale.
- [x] RTL styling: Fixed `ml-/mr-` → `ms-/me-` logical properties in `app-header.tsx`, `user-menu-content.tsx`, `appearance-tabs.tsx`, `dashboard.tsx`, `journal/index.tsx`, `journal/show.tsx`. Timeline uses explicit `isRtl` branching for its vertical line.

---

### Phase 9 — Light Mode Default Fix
- [x] [use-appearance.tsx](file:///d:/projects/Mementra/resources/js/hooks/use-appearance.tsx): Default stored appearance to `'light'` instead of `'system'`.

---

## Verification Plan

### Automated Tests
```bash
php artisan test
```

### Manual Verification
1. Visit `/` — should show beautiful Mementra landing page (not Laravel boilerplate).
2. Register a new user — auth pages should look premium.
3. Visit Dashboard — should show gradient hero, stats.
4. Create a journal entry — form should be clean and functional.
5. View the entry — show page should be elegant.
6. Click "Edit" on the entry — **edit page must load (not white screen)**.
7. Toggle dark mode in Settings → Appearance.
8. Change language to Arabic in Settings → Profile → Preferences. Reload — layout should flip RTL.
9. Run `npm run build` and verify no TypeScript or Vite errors.

---

## Progress Log
- **2026-09-21 (Session 1 & 2)**:
  - Fixed `UserFactory.php` to use `$this->faker` instead of `fake()`.
  - Fixed `JournalController.php` `edit()` and `show()` to normalize `blocks` and `media` plain arrays (preventing ResourceCollection `data` wrapping that crashes React components).
  - Fixed `use-appearance.tsx` to initialize default theme as `'light'`.
  - Established full Mementra design system in `app.css` (OKLCH color variables for light and dark modes, brand gradient utilities, typography).
  - Completed Phase 1 (`app.tsx`, `app.blade.php`), Phase 3 (`welcome.tsx`), Phase 4 (Logo, Sidebar), Phase 6 (Auth split layout + forms), Phase 9.

- **2026-09-21 (Session 3)**:
  - Completed Phase 5: All page redesigns — `dashboard.tsx`, `journal/index.tsx`, `journal/show.tsx`, `journal/create.tsx`, `journal/edit.tsx`, `events/index.tsx`, `reminders/index.tsx`, `timeline/index.tsx`, `relationship/index.tsx`, `memories/index.tsx`, `exports/index.tsx`.
  - Completed Phase 7: `settings/appearance.tsx` (heading updated, AppearanceTabs used), `settings/profile.tsx` (clean dividers, styled selects).
  - Build passed: `npm run build` ✓ — 2306 modules, no TypeScript errors.

- **2026-09-22 (Session 4)**:
  - Verified all Phase 5 pages already redesigned (confirmed via content check).
  - Completed Phase 8 RTL verification: Fixed directional `ml-/mr-/pl-/pr-` → logical `ms-/me-/ps-/pe-` in `app-header.tsx`, `user-menu-content.tsx`, `appearance-tabs.tsx`, `dashboard.tsx`, `journal/index.tsx`, `journal/show.tsx`. Timeline page already uses explicit `isRtl` branching.
  - Running final `npm run build` to confirm no regressions.
  - **ALL PHASES COMPLETE** ✓

- **2026-09-22 (Session 5 - Logo Presentation Fix)**:
  - Replaced hand-drawn placeholder Heart logo and gradient square box in `welcome.tsx` header and footer with the official `AppLogoIcon` (`public/logo.png`).
  - Globally removed box-shadows (`shadow-sm shadow-indigo-500/20`, `shadow-md shadow-indigo-500/30`), borders, rings, backgrounds, and sharp-cornered square wrapper boxes (`rounded-md`, `rounded-xl`) from all logo components and layouts.
  - Enhanced `AppLogoIcon` (`resources/js/components/app-logo-icon.tsx`) to enforce clean rendering: `object-contain shrink-0 bg-transparent border-0 shadow-none ring-0` so the transparent PNG blends naturally against any background in both light and dark modes.
  - Updated `app-logo.tsx`, `auth-split-layout.tsx`, `auth-simple-layout.tsx`, `auth-card-layout.tsx`, and `app-header.tsx`.
  - Verified build: `npm run build` ✓ — 2306 modules transformed, built cleanly in 14.72s with zero TypeScript/Vite errors.
