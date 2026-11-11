import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Heart,
    HeartHandshake,
    Images,
    ShieldCheck,
    Sparkles,
    User,
    UserCheck,
    UserPlus,
    UserX,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MemberItem {
    id: number;
    name: string;
    email: string;
    google_avatar?: string | null;
}

interface RelationshipItem {
    id: number;
    name: string;
    type: string;
    status: string;
    created_by: number;
    is_creator?: boolean;
    anniversary_date?: string | null;
    connected_at?: string | null;
    ended_at?: string | null;
    partner?: MemberItem | null;
    creator?: MemberItem | null;
    members?: MemberItem[] | { data?: MemberItem[] };
    created_at?: string;
}

interface RelationshipIndexProps {
    relationships?: RelationshipItem[] | { data?: RelationshipItem[] };
}

function normalizeList<T>(val: T[] | { data?: T[] } | undefined | null): T[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'object' && Array.isArray((val as { data?: T[] }).data)) {
        return (val as { data?: T[] }).data ?? [];
    }
    return [];
}

export default function RelationshipIndex({ relationships = [] }: RelationshipIndexProps) {
    const { auth, flash } = usePage().props as {
        auth?: { user?: { id: number; name: string; email: string; locale?: string } };
        flash?: { success?: string; error?: string; info?: string; warning?: string };
    };
    const currentUserId = auth?.user?.id;

    const rawRelationships = normalizeList<RelationshipItem>(relationships);

    const activeRel = rawRelationships.find((r) => r.status === 'active');
    const incomingPending = rawRelationships.filter(
        (r) => r.status === 'pending' && !r.is_creator && r.created_by !== currentUserId
    );
    const outgoingPending = rawRelationships.filter(
        (r) => r.status === 'pending' && (r.is_creator || r.created_by === currentUserId)
    );
    const endedRelationships = rawRelationships.filter(
        (r) => r.status === 'ended' || r.status === 'rejected' || r.status === 'cancelled'
    );

    const [disconnectRelId, setDisconnectRelId] = useState<number | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        partner_email: '',
        type: 'couple',
        name: '',
    });

    const getMembers = (rel: RelationshipItem): MemberItem[] => {
        return normalizeList<MemberItem>(rel.members);
    };

    const getPartner = (rel: RelationshipItem): MemberItem | null => {
        if (rel.partner) return rel.partner;
        const members = getMembers(rel);
        return members.find((m) => m.id !== currentUserId) ?? null;
    };

    const getCreator = (rel: RelationshipItem): MemberItem | null => {
        if (rel.creator) return rel.creator;
        const members = getMembers(rel);
        return members.find((m) => m.id === rel.created_by) ?? null;
    };

    const handleInvite = (e: FormEvent) => {
        e.preventDefault();
        post('/relationship', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleAccept = (id: number) => {
        setActionLoadingId(id);
        router.post(
            `/relationship/${id}/accept`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setActionLoadingId(null),
            }
        );
    };

    const handleDecline = (id: number) => {
        if (!confirm('Decline this connection request?')) return;
        setActionLoadingId(id);
        router.post(
            `/relationship/${id}/decline`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setActionLoadingId(null),
            }
        );
    };

    const handleCancel = (id: number) => {
        if (!confirm('Cancel this pending invitation?')) return;
        setActionLoadingId(id);
        router.post(
            `/relationship/${id}/cancel`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setActionLoadingId(null),
            }
        );
    };

    const handleConfirmDisconnect = () => {
        if (!disconnectRelId) return;
        setActionLoadingId(disconnectRelId);
        router.post(
            `/relationship/${disconnectRelId}/end`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setActionLoadingId(null);
                    setDisconnectRelId(null);
                },
            }
        );
    };

    return (
        <>
            <Head title="Our Story &amp; Connection — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Page Title */}
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Our Story &amp; Partnership
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Connect with your partner to collaborate on shared memories, milestones, and photo albums.
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <AlertTitle className="text-xs font-semibold">Success</AlertTitle>
                        <AlertDescription className="text-xs">{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
                        <AlertDescription className="text-xs">{flash.error}</AlertDescription>
                    </Alert>
                )}
                {flash?.info && (
                    <Alert className="border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <AlertTitle className="text-xs font-semibold">Information</AlertTitle>
                        <AlertDescription className="text-xs">{flash.info}</AlertDescription>
                    </Alert>
                )}

                {/* STATE D: Active Relationship */}
                {activeRel ? (
                    (() => {
                        const partner = getPartner(activeRel);
                        return (
                            <div className="space-y-6">
                                <Card className="border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-xs overflow-hidden">
                                    <CardHeader className="pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                                                    <Heart className="h-7 w-7 fill-white/90" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                                        <Sparkles className="h-3 w-3" />
                                                        <span>Active Partnership</span>
                                                    </div>
                                                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                                                        {activeRel.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">
                                                        Shared sanctuary between you and {partner?.name ?? 'your partner'}.
                                                    </CardDescription>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDisconnectRelId(activeRel.id)}
                                                    className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10"
                                                >
                                                    <UserX className="me-1.5 h-3.5 w-3.5" />
                                                    <span>Disconnect</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-6 pt-2">
                                        {/* Partner Details Card */}
                                        <div className="rounded-2xl bg-muted/30 p-4 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/20 shrink-0">
                                                    {partner?.name ? partner.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Connected Partner</p>
                                                    <p className="text-sm font-semibold text-foreground truncate">{partner?.name ?? 'Partner'}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{partner?.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center sm:border-s sm:border-border/60 sm:ps-4 text-xs space-y-1">
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                                                    <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                                    <span>
                                                        Connected:{' '}
                                                        {activeRel.connected_at
                                                            ? new Date(activeRel.connected_at).toLocaleDateString()
                                                            : 'Active'}
                                                    </span>
                                                </div>
                                                {activeRel.anniversary_date && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                                                        <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                                        <span>Anniversary: {activeRel.anniversary_date}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Links to Shared Spaces */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-auto p-3 flex flex-col items-start gap-1 rounded-xl border-border/70 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-start"
                                            >
                                                <Link href="/journal/create">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                        <BookOpen className="h-4 w-4 text-indigo-500" />
                                                        <span>Write Memory</span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">Record stories and photos together</span>
                                                </Link>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-auto p-3 flex flex-col items-start gap-1 rounded-xl border-border/70 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-start"
                                            >
                                                <Link href="/memories">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                        <Images className="h-4 w-4 text-purple-500" />
                                                        <span>Photo Gallery</span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">View chronologically preserved photos</span>
                                                </Link>
                                            </Button>

                                            <Button
                                                asChild
                                                variant="outline"
                                                className="h-auto p-3 flex flex-col items-start gap-1 rounded-xl border-border/70 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-start"
                                            >
                                                <Link href="/timeline">
                                                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                                        <Clock className="h-4 w-4 text-amber-500" />
                                                        <span>Shared Timeline</span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground">Revisit milestones and memories</span>
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Privacy Notice */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-1">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                            <span>
                                                Your private journal entries and personal media remain strictly isolated to your account unless explicitly shared.
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })()
                ) : (
                    <div className="space-y-6">
                        {/* STATE C: Incoming Connection Requests */}
                        {incomingPending.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <HeartHandshake className="h-4 w-4 text-amber-500" />
                                    <span>Incoming Connection Requests ({incomingPending.length})</span>
                                </h2>

                                {incomingPending.map((rel) => {
                                    const sender = getCreator(rel) ?? getPartner(rel);
                                    const isLoading = actionLoadingId === rel.id;

                                    return (
                                        <Card key={rel.id} className="border-amber-500/30 bg-amber-500/5 shadow-xs">
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                            <UserCheck className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-base font-bold text-foreground">
                                                                Invitation from {sender?.name ?? 'Partner'}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                <span className="font-medium text-foreground">{sender?.email}</span> invited you to connect your Mementra accounts.
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 self-start sm:self-auto pt-1 sm:pt-0">
                                                        <Button
                                                            size="sm"
                                                            disabled={isLoading}
                                                            onClick={() => handleAccept(rel.id)}
                                                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                                        >
                                                            {isLoading ? 'Connecting...' : 'Accept Invitation'}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isLoading}
                                                            onClick={() => handleDecline(rel.id)}
                                                            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                                                        >
                                                            Decline
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* STATE B: Outgoing Pending Invitations */}
                        {outgoingPending.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-indigo-400" />
                                    <span>Sent Invitations ({outgoingPending.length})</span>
                                </h2>

                                {outgoingPending.map((rel) => {
                                    const partner = getPartner(rel);
                                    const isLoading = actionLoadingId === rel.id;

                                    return (
                                        <Card key={rel.id} className="border-indigo-500/20 bg-indigo-500/5 shadow-xs">
                                            <CardHeader className="pb-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                            <Clock className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                                                <span>Pending Partner Confirmation</span>
                                                            </div>
                                                            <CardTitle className="text-base font-bold text-foreground">
                                                                Invitation sent to {partner?.name ?? partner?.email ?? 'Partner'}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                Sent to <span className="font-medium text-foreground">{partner?.email}</span>. Waiting for your partner to accept.
                                                            </CardDescription>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isLoading}
                                                        onClick={() => handleCancel(rel.id)}
                                                        className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border self-start sm:self-auto"
                                                    >
                                                        Cancel Invitation
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {/* STATE A: Connect Form (Shown when no outgoing pending invitation) */}
                        {outgoingPending.length === 0 && (
                            <Card className="border-border/80 bg-card shadow-xs">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-foreground">
                                                Connect With Your Partner
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Enter your partner&apos;s registered Mementra email to link your living journals together.
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-2">
                                    <form onSubmit={handleInvite} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="partner_email"
                                                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                            >
                                                Partner&apos;s Registered Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="partner_email"
                                                type="email"
                                                placeholder="e.g. partner@example.com"
                                                value={data.partner_email}
                                                onChange={(e) => setData('partner_email', e.target.value)}
                                                className="h-11 text-sm rounded-xl"
                                                required
                                            />
                                            {errors.partner_email && (
                                                <p className="text-xs text-destructive font-medium mt-1">
                                                    {errors.partner_email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="name"
                                                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                            >
                                                Connection Name (Optional)
                                            </Label>
                                            <Input
                                                id="name"
                                                placeholder="e.g. Our Sanctuary, Alex &amp; Sam"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="h-10 text-sm rounded-xl"
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive font-medium mt-1">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-indigo-500/25 px-6"
                                            >
                                                {processing ? 'Sending Request...' : 'Send Connection Request'}
                                            </Button>
                                        </div>

                                        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed">
                                            <p className="font-semibold text-foreground mb-0.5">How Partner Linking Works:</p>
                                            Both partners maintain independent Mementra accounts and their own Google Drive storage. Once linked, you can share journal memories, view shared milestones, and preserve joint memories without relinquishing control over your private files.
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* STATE E: Past Ended Connections (Subtle history) */}
                        {endedRelationships.length > 0 && (
                            <div className="space-y-2 pt-4 border-t border-border/50">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Past Connections ({endedRelationships.length})
                                </h3>
                                <div className="space-y-1.5">
                                    {endedRelationships.map((rel) => {
                                        const partner = getPartner(rel);
                                        return (
                                            <div
                                                key={rel.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Heart className="h-3.5 w-3.5 text-muted-foreground/60" />
                                                    <span className="font-medium text-foreground">
                                                        {rel.name || `With ${partner?.name ?? partner?.email ?? 'Partner'}`}
                                                    </span>
                                                    <span className="capitalize text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border/60">
                                                        {rel.status}
                                                    </span>
                                                </div>
                                                {rel.ended_at && (
                                                    <span className="font-mono text-[11px]">
                                                        Ended: {new Date(rel.ended_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Disconnect Confirmation Dialog */}
            <Dialog open={disconnectRelId !== null} onOpenChange={(open) => !open && setDisconnectRelId(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-destructive">
                            <UserX className="h-5 w-5" />
                            <span>Disconnect Partner Connection?</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs leading-relaxed pt-2">
                            Ending this relationship will disconnect your accounts and terminate reciprocal memory sharing.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>
                                <strong>Your data is 100% safe:</strong> All your personal journal entries, uploaded media, and files in your Google Drive will remain intact in your account.
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>
                                Any shared memories will no longer be visible to your partner, but independent copies previously saved by either partner into their Google Drive remain in their personal storage.
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDisconnectRelId(null)}
                            disabled={actionLoadingId !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={actionLoadingId !== null}
                            onClick={handleConfirmDisconnect}
                        >
                            {actionLoadingId !== null ? 'Disconnecting...' : 'Yes, End Connection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RelationshipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Our Story', href: '/relationship' },
    ],
};
