import type { InertiaLinkProps } from '@inertiajs/react';
import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { User, ShieldCheck, Palette, Cloud, type LucideIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

interface SettingsNavItem {
    title: string;
    titleAr: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon: LucideIcon;
    description: string;
    descriptionAr: string;
}

const settingsNavItems: SettingsNavItem[] = [
    {
        title: 'Profile',
        titleAr: 'الملف الشخصي',
        href: editProfile(),
        icon: User,
        description: 'Account information & locale',
        descriptionAr: 'معلومات الحساب واللغة',
    },
    {
        title: 'Security',
        titleAr: 'الأمان',
        href: editSecurity(),
        icon: ShieldCheck,
        description: 'Password, 2FA & passkeys',
        descriptionAr: 'كلمة المرور والمصادقة الثنائية',
    },
    {
        title: 'Appearance',
        titleAr: 'المظهر',
        href: editAppearance(),
        icon: Palette,
        description: 'Theme & display options',
        descriptionAr: 'السمة وخيارات العرض',
    },
    {
        title: 'Integrations',
        titleAr: 'التكاملات والربط',
        href: '/settings/integrations',
        icon: Cloud,
        description: 'Google Drive & cloud storage',
        descriptionAr: 'جوجل درايف والتخزين السحابي',
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { props } = usePage();
    const userLocale = (props as any)?.auth?.user?.locale || (props as any)?.locale || 'en';
    const isRtl = (props as any)?.dir === 'rtl' || userLocale === 'ar';
    const translations = (props as any)?.translations?.settings;

    const pageTitle = translations?.title || (isRtl ? 'الإعدادات' : 'Settings');
    const pageDescription =
        translations?.description ||
        (isRtl
            ? 'إدارة حسابك الشخصي، الأمان، المظهر، وخدمات التخزين السحابي.'
            : 'Manage your profile, security preferences, appearance, and cloud integrations.');

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Settings Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {pageTitle}
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    {pageDescription}
                </p>
            </div>

            <Separator className="border-border/60" />

            <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
                {/* Desktop & Mobile Navigation Rail */}
                <aside className="w-full lg:w-64 xl:w-72 shrink-0">
                    {/* Mobile Horizontal Navigation */}
                    <div className="lg:hidden">
                        <nav
                            className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth"
                            aria-label={isRtl ? 'أقسام الإعدادات' : 'Settings tabs'}
                        >
                            {settingsNavItems.map((item) => {
                                const active = isCurrentOrParentUrl(item.href);
                                const Icon = item.icon;
                                const title = isRtl ? item.titleAr : item.title;

                                return (
                                    <Link
                                        key={toUrl(item.href)}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150',
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        <span>{title}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Desktop Vertical Navigation */}
                    <nav
                        className="hidden lg:flex lg:flex-col gap-1.5"
                        aria-label={isRtl ? 'إعدادات الحساب' : 'Settings navigation'}
                    >
                        {settingsNavItems.map((item) => {
                            const active = isCurrentOrParentUrl(item.href);
                            const Icon = item.icon;
                            const title = isRtl ? item.titleAr : item.title;
                            const description = isRtl ? item.descriptionAr : item.description;

                            return (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm transition-all duration-150 border',
                                        active
                                            ? 'bg-primary/10 text-primary font-semibold border-primary/20 shadow-xs dark:bg-primary/15 dark:border-primary/30'
                                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border-transparent'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-xs'
                                                : 'bg-muted/80 text-muted-foreground group-hover:bg-muted group-hover:text-foreground'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="truncate leading-tight">{title}</span>
                                        <span className="text-[11px] font-normal text-muted-foreground/80 truncate leading-tight mt-0.5">
                                            {description}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Settings Page Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
