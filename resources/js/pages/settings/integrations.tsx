import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Unlink,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Clock,
    FolderCheck,
    Sparkles,
    HardDrive,
    Lock,
    ExternalLink,
} from 'lucide-react';
import { GoogleDriveIcon } from '@/components/icons/google-drive-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';

interface StorageConnectionProps {
    id: number;
    provider: string;
    provider_email?: string;
    status: 'connected' | 'disconnected' | 'expired' | 'reauthorization_required' | 'error';
    is_connected: boolean;
    connected_at?: string;
    last_verified_at?: string;
}

interface IntegrationsPageProps {
    connection?: StorageConnectionProps | null;
}

export default function IntegrationsSettings({ connection }: IntegrationsPageProps) {
    const [testing, setTesting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

    const { props } = usePage();
    const userLocale = (props as any)?.auth?.user?.locale || (props as any)?.locale || 'en';
    const isRtl = (props as any)?.dir === 'rtl' || userLocale === 'ar';
    const translations = (props as any)?.translations?.integrations;

    const isConnected = Boolean(connection && connection.is_connected && connection.status === 'connected');
    const isReauthRequired = Boolean(
        connection && (connection.status === 'reauthorization_required' || connection.status === 'expired' || connection.status === 'error')
    );

    const handleConnect = () => {
        window.location.href = '/integrations/google-drive/redirect';
    };

    const handleTest = () => {
        setTesting(true);
        router.post(
            '/integrations/google-drive/test',
            {},
            {
                preserveScroll: true,
                onFinish: () => setTesting(false),
            }
        );
    };

    const handleDisconnect = () => {
        setDisconnecting(true);
        router.delete('/integrations/google-drive/disconnect', {
            preserveScroll: true,
            onFinish: () => {
                setDisconnecting(false);
                setShowDisconnectDialog(false);
            },
        });
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '—';
        try {
            return new Date(isoString).toLocaleDateString(isRtl ? 'ar' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return isoString;
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return '—';
        try {
            return new Date(isoString).toLocaleTimeString(isRtl ? 'ar' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

    return (
        <>
            <Head title={isRtl ? 'التكاملات والربط — Mementra' : 'Integrations — Mementra'} />

            <div className="space-y-8">
                {/* Page Introduction */}
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        {translations?.title || (isRtl ? 'التكاملات والربط' : 'Integrations')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {translations?.description ||
                            (isRtl
                                ? 'ربط الخدمات الخارجية لتوسيع تجربة استخدامك في ميمنترا.'
                                : 'Connect external services to extend your Mementra experience.')}
                    </p>
                </div>

                {/* Primary Integration: Google Drive */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {isRtl ? 'التخزين السحابي الشخصي' : 'Personal Cloud Storage'}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                            OAuth 2.0 &bull; Google Drive v3
                        </span>
                    </div>

                    <Card className="overflow-hidden border-border/80 bg-card shadow-xs transition-all hover:border-border">
                        {/* Header */}
                        <CardHeader className="border-b border-border/50 pb-5 pt-6 bg-muted/10">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background border border-border/80 shadow-xs p-2.5">
                                        <GoogleDriveIcon className="h-full w-full object-contain" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base font-semibold text-foreground">
                                                {translations?.google_drive?.name || 'Google Drive'}
                                            </CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            {isRtl
                                                ? 'تخزين وسائط مستقل • خزينة سحابية خاصة بك'
                                                : 'Independent Cloud Storage &bull; Personal Media Vault'}
                                        </CardDescription>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isConnected ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium py-1 px-3 text-xs shadow-2xs"
                                        >
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                            </span>
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            <span>{translations?.google_drive?.connected || (isRtl ? 'متصل' : 'Connected')}</span>
                                        </Badge>
                                    ) : isReauthRequired ? (
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium py-1 px-3 text-xs shadow-2xs"
                                        >
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            <span>
                                                {translations?.google_drive?.reauth_required ||
                                                    (isRtl ? 'إعادة المصادقة مطلوبة' : 'Reauthorization Required')}
                                            </span>
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="gap-1.5 border-border bg-muted/40 text-muted-foreground font-medium py-1 px-3 text-xs"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                                            <span>
                                                {translations?.google_drive?.disconnected || (isRtl ? 'غير متصل' : 'Not Connected')}
                                            </span>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        {/* Card Body */}
                        <CardContent className="pt-6 space-y-6">
                            {/* Not Connected State */}
                            {!isConnected && !isReauthRequired && (
                                <div className="space-y-5">
                                    <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4 text-xs leading-relaxed text-muted-foreground space-y-2">
                                        <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                                            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>{isRtl ? 'تخزين خاص ومستقل بنسبة 100%' : 'Independent & Private Storage'}</span>
                                        </p>
                                        <p className="text-muted-foreground">
                                            {translations?.google_drive?.description ||
                                                (isRtl
                                                    ? 'احفظ ذكرياتك وصورك عالية الدقة مباشرة في مساحة التخزين الخاصة بك على جوجل درايف. تبقى ملفاتك بالكامل داخل حساب جوجل الخاص بك، ولا تحتفظ ميمنترا بأي ملفات وسائط خام على خوادم مركزية.'
                                                    : 'Store your personal memories and media directly in your own Google Drive. Your files remain strictly inside your Google account. Mementra stores only metadata, relationships, and journal entries in its database.')}
                                        </p>
                                    </div>

                                    {/* Benefits Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>
                                                {isRtl
                                                    ? 'خصوصية افتراضية — ملفاتك لا تظهر للعامة ومحمية ببروتوكول جوجل'
                                                    : 'Private by default &mdash; files are never publicly exposed or shared with third parties'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>
                                                {isRtl
                                                    ? 'نسخ مستقلة للشريكين — يمكن لشريكك حفظ نسخة كاملة في درايف الخاص به'
                                                    : 'Independent partner copies &mdash; your partner can save full copies to their own Drive'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            onClick={handleConnect}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-xs cursor-pointer"
                                        >
                                            <GoogleDriveIcon className="h-4 w-4" />
                                            <span>{translations?.google_drive?.connect || (isRtl ? 'ربط جوجل درايف' : 'Connect Google Drive')}</span>
                                            <ArrowIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Reauthorization Required State */}
                            {isReauthRequired && (
                                <div className="space-y-5">
                                    <Alert className="rounded-2xl border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                        <AlertTitle className="text-xs font-bold">
                                            {translations?.google_drive?.error_title ||
                                                (isRtl ? 'انتهت صلاحية جلسة الوصول' : 'Session or Token Expired')}
                                        </AlertTitle>
                                        <AlertDescription className="text-xs mt-1 text-amber-800 dark:text-amber-300">
                                            {translations?.google_drive?.error_description ||
                                                (isRtl
                                                    ? 'يحتاج رمز الوصول إلى جوجل درايف لإعادة مصادقة لمواصلة مزامنة وسائط الذكريات.'
                                                    : 'Google Drive access token requires reauthorization to continue synchronizing your memories.')}
                                        </AlertDescription>
                                    </Alert>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            onClick={handleConnect}
                                            className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs cursor-pointer"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            <span>{translations?.google_drive?.retry || (isRtl ? 'إعادة ربط جوجل درايف' : 'Reconnect Google Drive')}</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDisconnectDialog(true)}
                                            className="text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                                        >
                                            <Unlink className="h-3.5 w-3.5 me-1.5" />
                                            <span>{translations?.google_drive?.disconnect || (isRtl ? 'إلغاء الربط' : 'Disconnect')}</span>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Connected State */}
                            {isConnected && (
                                <div className="space-y-6">
                                    {/* Storage & Account Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                        <div className="rounded-2xl bg-muted/20 border border-border/70 p-4 space-y-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <HardDrive className="h-3.5 w-3.5 text-primary" />
                                                <span>{translations?.google_drive?.account || (isRtl ? 'الحساب المتصل' : 'Connected Account')}</span>
                                            </span>
                                            <p className="text-sm font-medium text-foreground truncate" title={connection?.provider_email}>
                                                {connection?.provider_email || (isRtl ? 'حساب جوجل المعتمد' : 'Authenticated Google Account')}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-muted/20 border border-border/70 p-4 space-y-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <FolderCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                <span>{translations?.google_drive?.storage_folder || (isRtl ? 'موقع التخزين' : 'Storage Location')}</span>
                                            </span>
                                            <p className="text-sm font-medium text-foreground">
                                                {translations?.google_drive?.storage_folder_value || (isRtl ? 'مجلد Mementra المخصص' : 'Mementra Dedicated Vault')}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-muted/20 border border-border/70 p-4 space-y-1.5 sm:col-span-2 lg:col-span-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                                <span>{translations?.google_drive?.connected_since || (isRtl ? 'تاريخ الربط' : 'Connected Since')}</span>
                                            </span>
                                            <p className="text-xs font-mono text-foreground">
                                                {formatDate(connection?.connected_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Last Verified Sub-note */}
                                    {connection?.last_verified_at && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            <span>
                                                {translations?.google_drive?.last_verified || (isRtl ? 'آخر تحقق من الاتصال: ' : 'Last verified: ')}
                                                <span className="font-mono text-foreground/80">{formatDate(connection.last_verified_at)} at {formatTime(connection.last_verified_at)}</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Actions Row */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleTest}
                                                disabled={testing}
                                                className="text-xs gap-1.5 cursor-pointer"
                                            >
                                                <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
                                                <span>
                                                    {testing
                                                        ? translations?.google_drive?.testing || (isRtl ? 'جاري الفحص...' : 'Testing...')
                                                        : translations?.google_drive?.test || (isRtl ? 'اختبار الاتصال' : 'Test Connection')}
                                                </span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleConnect}
                                                className="text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                <span>{translations?.google_drive?.reconnect || (isRtl ? 'إعادة الاتصال' : 'Reconnect')}</span>
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDisconnectDialog(true)}
                                            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 cursor-pointer"
                                        >
                                            <Unlink className="h-3.5 w-3.5" />
                                            <span>{translations?.google_drive?.disconnect || (isRtl ? 'إلغاء الربط' : 'Disconnect')}</span>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Upcoming Integrations Catalog */}
                <section className="space-y-4 pt-2">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-semibold text-foreground">
                            {translations?.upcoming?.title || (isRtl ? 'تكاملات قادمة' : 'Upcoming Integrations')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {translations?.upcoming?.subtitle ||
                                (isRtl
                                    ? 'مزيد من خدمات التخزين السحابي والتقويم ستتوفر قريباً.'
                                    : 'Additional cloud storage and calendar integrations coming soon.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Dropbox Card */}
                        <Card className="border-border/60 bg-card/60 shadow-2xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                                        DB
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal text-muted-foreground">
                                        {translations?.upcoming?.coming_soon || (isRtl ? 'قريباً' : 'Coming Soon')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-sm font-semibold mt-2.5">
                                    {translations?.upcoming?.dropbox || 'Dropbox'}
                                </CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {translations?.upcoming?.dropbox_desc ||
                                        (isRtl
                                            ? 'حفظ ومزامنة ذكرياتك احتياطياً في حسابك الشخصي على دروب بوكس.'
                                            : 'Backup and synchronize memories with your personal Dropbox storage.')}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Apple iCloud Card */}
                        <Card className="border-border/60 bg-card/60 shadow-2xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xs">
                                        iC
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal text-muted-foreground">
                                        {translations?.upcoming?.coming_soon || (isRtl ? 'قريباً' : 'Coming Soon')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-sm font-semibold mt-2.5">
                                    {translations?.upcoming?.icloud || 'Apple iCloud'}
                                </CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {translations?.upcoming?.icloud_desc ||
                                        (isRtl
                                            ? 'مزامنة وحفظ صور الذكريات بسلاسة عبر جميع أجهزة آبل الخاصة بك.'
                                            : 'Store and access photo memories seamlessly across your Apple devices.')}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Google Calendar Card */}
                        <Card className="border-border/60 bg-card/60 shadow-2xs">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
                                        GC
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] py-0 px-2 font-normal text-muted-foreground">
                                        {translations?.upcoming?.coming_soon || (isRtl ? 'قريباً' : 'Coming Soon')}
                                    </Badge>
                                </div>
                                <CardTitle className="text-sm font-semibold mt-2.5">
                                    {translations?.upcoming?.google_calendar || 'Google Calendar'}
                                </CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {translations?.upcoming?.google_calendar_desc ||
                                        (isRtl
                                            ? 'مزامنة الذكريات السنوية والمناسبات والتذكيرات المشتركة.'
                                            : 'Sync relationship anniversaries, shared reminders, and key milestones.')}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </section>
            </div>

            {/* Accessible Radix Disconnect Confirmation Dialog */}
            <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="gap-2">
                        <div className="mx-auto sm:mx-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <DialogTitle className="text-base font-semibold">
                            {translations?.google_drive?.disconnect_title ||
                                (isRtl ? 'هل أنت متأكد من إلغاء ربط جوجل درايف؟' : 'Disconnect Google Drive?')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                            {translations?.google_drive?.disconnect_confirm ||
                                (isRtl
                                    ? 'سيؤدي إلغاء الربط إلى إيقاف مزامنة الوسائط والذكريات الجديدة مع حسابك. لن يتم حذف أي ملفات مخزنة حالياً في جوجل درايف، وستبقى ذكرياتك داخل ميمنترا محفوظة بالكامل. يمكنك إعادة الربط في أي وقت.'
                                    : 'Disconnecting will stop syncing new memory media to your Google Drive account. Your existing files in Google Drive will NOT be deleted, and all Mementra memory entries remain intact. You can reconnect anytime.')}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDisconnectDialog(false)}
                            className="text-xs cursor-pointer"
                        >
                            {translations?.google_drive?.disconnect_cancel || (isRtl ? 'إلغاء' : 'Cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleDisconnect}
                            disabled={disconnecting}
                            className="text-xs cursor-pointer"
                        >
                            {disconnecting
                                ? translations?.google_drive?.disconnecting || (isRtl ? 'جاري إلغاء الربط...' : 'Disconnecting...')
                                : translations?.google_drive?.disconnect_action || (isRtl ? 'نعم، قم بإلغاء الربط' : 'Yes, Disconnect')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

IntegrationsSettings.layout = {
    breadcrumbs: [
        {
            title: 'Settings',
            href: '/settings/profile',
        },
        {
            title: 'Integrations',
            href: '/settings/integrations',
        },
    ],
};
