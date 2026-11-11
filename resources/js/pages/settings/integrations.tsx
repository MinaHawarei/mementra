import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw, Unlink, ExternalLink, HardDrive, ShieldCheck, ArrowRight } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SettingsLayout from '@/layouts/settings/layout';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Integrations', href: '/settings/integrations' },
];

export default function IntegrationsSettings({ connection }: IntegrationsPageProps) {
    const [testing, setTesting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

    const isConnected = connection && connection.is_connected && connection.status === 'connected';
    const isReauthRequired = connection && (connection.status === 'reauthorization_required' || connection.status === 'expired');

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
                setShowDisconnectConfirm(false);
            },
        });
    };

    return (
        <SettingsLayout>
            <Head title="Storage Integrations — Mementra" />

            <div className="space-y-6">
                <Heading
                    title="Cloud Integrations"
                    description="Connect your personal cloud storage to preserve memories in your own accounts."
                />

                {/* Google Drive Integration Card */}
                <Card className="border-border/70 bg-card shadow-xs transition-all">
                    <CardHeader className="pb-4 border-b border-border/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <HardDrive className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <span>Google Drive</span>
                                        {isConnected && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Connected</span>
                                            </span>
                                        )}
                                        {isReauthRequired && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                <AlertCircle className="h-3 w-3" />
                                                <span>Reauthorization Required</span>
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Personal Cloud Storage &bull; Decentralized Media Vault
                                    </CardDescription>
                                </div>
                            </div>

                            <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/40 self-start sm:self-auto">
                                Google Drive API v3
                            </span>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {!isConnected && !isReauthRequired ? (
                            /* Disconnected State */
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-4 text-xs leading-relaxed text-muted-foreground space-y-2">
                                    <p className="font-medium text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 text-indigo-500" />
                                        <span>Independent User-Owned Storage</span>
                                    </p>
                                    <p>
                                        Store your personal memories and media directly in your own Google Drive.
                                        Your files remain strictly inside your Google account. Mementra stores only metadata, relationships, and journal entries in its database.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Private by default &mdash; files are never publicly exposed</span>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Independent copies &mdash; partners can save copies to their own Drive</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={handleConnect}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm shadow-indigo-500/25"
                                    >
                                        <Cloud className="h-4 w-4" />
                                        <span>Connect Google Drive</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : isReauthRequired ? (
                            /* Reauthorization Required State */
                            <div className="space-y-4">
                                <Alert variant="destructive" className="rounded-2xl border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <AlertTitle className="text-xs font-bold">Session or Token Expired</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Google Drive access token requires reauthorization to continue synchronizing your memories.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handleConnect}
                                        className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        <span>Reconnect Google Drive</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowDisconnectConfirm(true)}
                                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                                    >
                                        <Unlink className="h-3.5 w-3.5 me-1" />
                                        <span>Disconnect</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Connected State */
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-muted/20 border border-border/60 p-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Connected Account</span>
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {connection?.provider_email || 'Authenticated User'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Storage Provider</span>
                                        <p className="text-sm font-medium text-foreground">
                                            Google Drive &bull; Dedicated Folder
                                        </p>
                                    </div>

                                    {connection?.connected_at && (
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Connected Since</span>
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {new Date(connection.connected_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {connection?.last_verified_at && (
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Last Verified</span>
                                            <p className="text-xs font-mono text-muted-foreground">
                                                {new Date(connection.last_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Row */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleTest}
                                            disabled={testing}
                                            className="text-xs gap-1.5"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
                                            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleConnect}
                                            className="text-xs gap-1.5"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            <span>Reconnect</span>
                                        </Button>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDisconnectConfirm(true)}
                                        className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                                    >
                                        <Unlink className="h-3.5 w-3.5" />
                                        <span>Disconnect</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Disconnect Confirmation Modal */}
                        {showDisconnectConfirm && (
                            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Are you sure you want to disconnect Google Drive?</span>
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Disconnecting will stop syncing new memory media to Google Drive.
                                        Your existing files in Google Drive will <strong>NOT</strong> be deleted.
                                        Mementra metadata will be preserved. You can reconnect anytime.
                                    </p>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDisconnectConfirm(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDisconnect}
                                        disabled={disconnecting}
                                        className="text-xs"
                                    >
                                        {disconnecting ? 'Disconnecting...' : 'Yes, Disconnect'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
    );
}

IntegrationsSettings.layout = (page: React.ReactNode) => page;

