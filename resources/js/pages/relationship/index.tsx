import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Heart, UserCheck, UserPlus, Sparkles, ShieldCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RelationshipIndexProps {
    relationships: Array<{
        id: number;
        name: string;
        type: string;
        status: string;
        anniversary_date?: string;
        connected_at?: string;
        members: Array<{ id: number; name: string; email: string }>;
    }>;
}

export default function RelationshipIndex({ relationships = [] }: RelationshipIndexProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        partner_email: '',
        type: 'couple',
        name: '',
    });

    const activeRel = relationships.find((r) => r.status === 'active');
    const pendingRel = relationships.find((r) => r.status === 'pending');

    const handleInvite = (e: FormEvent) => {
        e.preventDefault();
        post('/relationship', {
            onSuccess: () => reset(),
        });
    };

    const handleAccept = (id: number) => {
        router.post(`/relationship/${id}/accept`);
    };

    const handleEnd = (id: number) => {
        if (confirm('End this connection? Your personal memories and uploaded photos will remain safely preserved in your account.')) {
            router.post(`/relationship/${id}/end`);
        }
    };

    return (
        <>
            <Head title="Our Story &amp; Connection — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Our Story &amp; Partnership</h1>
                    <p className="text-sm text-muted-foreground">
                        Connect with your partner to collaborate on shared memories, milestones, and photo albums.
                    </p>
                </div>

                {activeRel ? (
                    <Card className="border-indigo-500/30 bg-gradient-to-br from-card via-card to-indigo-500/5 shadow-xs overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                                    <Heart className="h-7 w-7 fill-white/90" />
                                </div>
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                                        <Sparkles className="h-3 w-3" />
                                        <span>Active Connection</span>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">{activeRel.name}</CardTitle>
                                    <CardDescription className="text-xs">
                                        Shared sanctuary between {activeRel.members.map((m) => m.name).join(' & ')}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="rounded-xl bg-muted/30 p-4 border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-mono">
                                    <Calendar className="h-4 w-4 text-indigo-400" />
                                    <span>Connected: {activeRel.connected_at ? new Date(activeRel.connected_at).toLocaleDateString() : 'Active'}</span>
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEnd(activeRel.id)}
                                    className="h-8 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 self-start sm:self-auto"
                                >
                                    Disconnect
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 pt-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Your private journal entries remain safe and isolated to your account.</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : pendingRel ? (
                    <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Pending Connection Request</CardTitle>
                                    <CardDescription className="text-xs">
                                        Invitation with {pendingRel.members.map((m) => m.name).join(' & ')} is waiting for your confirmation.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <Button onClick={() => handleAccept(pendingRel.id)} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                                Accept Invitation &amp; Connect
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-border/80 bg-card shadow-xs">
                        <CardHeader>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Connect With Your Partner</CardTitle>
                                    <CardDescription className="text-xs">
                                        Enter your partner&apos;s registered email to link your living journals together.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="partner_email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Partner&apos;s Registered Email
                                    </Label>
                                    <Input
                                        id="partner_email"
                                        type="email"
                                        placeholder="partner@example.com"
                                        value={data.partner_email}
                                        onChange={(e) => setData('partner_email', e.target.value)}
                                        className="h-10 text-sm rounded-xl"
                                        required
                                    />
                                    {errors.partner_email && <p className="text-xs text-destructive">{errors.partner_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Connection Name (Optional)
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Alex &amp; Sam&apos;s Journey"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="h-10 text-sm rounded-xl"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-indigo-500/25 px-6"
                                >
                                    {processing ? 'Sending...' : 'Send Connection Request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

RelationshipIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Our Story', href: '/relationship' },
    ],
};
