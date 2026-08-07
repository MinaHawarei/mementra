import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Heart, UserCheck, UserPlus, XCircle } from 'lucide-react';
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
        if (confirm('End this connection? Your owned memories and photos will remain safely in your account.')) {
            router.post(`/relationship/${id}/end`);
        }
    };

    return (
        <>
            <Head title="Our Story & Connection" />
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Relationship Connection</h1>
                    <p className="text-sm text-muted-foreground">
                        Connect with your partner to share stories and collaborate on shared memories.
                    </p>
                </div>

                {activeRel ? (
                    <Card className="border-rose-200 bg-rose-50/20 dark:border-rose-950 dark:bg-rose-950/10">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400">
                                    <Heart className="h-6 w-6 fill-current" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">{activeRel.name}</CardTitle>
                                    <CardDescription>
                                        Active connection between {activeRel.members.map((m) => m.name).join(' & ')}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                                <span>Connected on: {activeRel.connected_at ? new Date(activeRel.connected_at).toLocaleDateString() : 'Active'}</span>
                                <Button variant="outline" size="sm" onClick={() => handleEnd(activeRel.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                    Disconnect
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : pendingRel ? (
                    <Card className="border-amber-200 bg-amber-50/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <UserCheck className="h-6 w-6 text-amber-600" />
                                <div>
                                    <CardTitle className="text-lg">Pending Connection Invitation</CardTitle>
                                    <CardDescription>
                                        Invitation with {pendingRel.members.map((m) => m.name).join(' & ')} is pending response.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => handleAccept(pendingRel.id)} className="bg-amber-600 hover:bg-amber-700">
                                Accept Invitation
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-rose-500" />
                                <CardTitle className="text-lg">Connect With Your Partner</CardTitle>
                            </div>
                            <CardDescription>
                                Enter your partner's Mementra email to send a connection request.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="partner_email">Partner's Registered Email</Label>
                                    <Input
                                        id="partner_email"
                                        type="email"
                                        placeholder="partner@example.com"
                                        value={data.partner_email}
                                        onChange={(e) => setData('partner_email', e.target.value)}
                                        required
                                    />
                                    {errors.partner_email && <p className="text-xs text-red-500">{errors.partner_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Story / Relationship Name (Optional)</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Alex & Sam's Journey"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                </div>

                                <Button type="submit" disabled={processing} className="bg-rose-600 hover:bg-rose-700">
                                    Send Connection Request
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
