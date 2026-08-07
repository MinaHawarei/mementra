import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bell, Calendar, Edit, Lock, MapPin, Share2, Smile, Trash, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MediaItem {
    id: number;
    original_filename: string;
}

interface ReminderItem {
    id: number;
    title: string;
    remind_at: string;
    recurrence: string;
}

interface ShareItem {
    id: number;
    target_user?: { id: number; name: string };
    permission: string;
    starts_at?: string;
    ends_at?: string;
}

interface JournalShowProps {
    entry: {
        id: number;
        title: string;
        entry_date: string;
        mood?: string;
        location_name?: string;
        is_private: boolean;
        owner?: { id: number; name: string };
        blocks?: Array<{ id: number; type: string; content?: { text?: string } }>;
        media?: MediaItem[];
        shares?: ShareItem[];
        reminders?: ReminderItem[];
    };
    partner?: { id: number; name: string } | null;
}

export default function JournalShow({ entry, partner }: JournalShowProps) {
    const [showRememberModal, setShowRememberModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [remindAt, setRemindAt] = useState(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    );
    const [recurrence, setRecurrence] = useState('yearly');
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [permission, setPermission] = useState('view');
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this memory?')) {
            router.delete(`/journal/${entry.id}`);
        }
    };

    const handleRememberSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            `/journal/${entry.id}/remember`,
            { remind_at: remindAt, recurrence },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowRememberModal(false);
                },
            }
        );
    };

    const handleShareSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!partner) return;
        setProcessing(true);
        router.post(
            `/journal/${entry.id}/share`,
            {
                target_user_id: partner.id,
                permission,
                starts_at: startsAt || null,
                ends_at: endsAt || null,
            },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowShareModal(false);
                },
            }
        );
    };

    const handleRevokeShare = (shareId: number) => {
        if (confirm('Revoke access for this share?')) {
            router.delete(`/shares/${shareId}`);
        }
    };

    return (
        <>
            <Head title={entry.title} />
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="gap-1">
                        <Link href="/journal">
                            <ArrowLeft className="h-4 w-4" /> Back to Journal
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        {partner && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowShareModal(!showShareModal)}
                                className="gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            >
                                <Share2 className="h-4 w-4" /> Share Memory
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRememberModal(!showRememberModal)}
                            className="gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                            <Bell className="h-4 w-4" /> Remember This
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1">
                            <Link href={`/journal/${entry.id}/edit`}>
                                <Edit className="h-4 w-4" /> Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
                            <Trash className="h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                {/* Share Modal inline */}
                {showShareModal && partner && (
                    <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                <Share2 className="h-4 w-4" /> Share with {partner.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <form onSubmit={handleShareSubmit} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="starts_at" className="text-xs">Access Start Date (Optional)</Label>
                                        <Input
                                            id="starts_at"
                                            type="date"
                                            value={startsAt}
                                            onChange={(e) => setStartsAt(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="ends_at" className="text-xs">Access End Date (Optional)</Label>
                                        <Input
                                            id="ends_at"
                                            type="date"
                                            value={endsAt}
                                            onChange={(e) => setEndsAt(e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="permission" className="text-xs">Permission:</Label>
                                        <select
                                            id="permission"
                                            className="h-8 rounded-md border border-input bg-transparent px-3 text-xs"
                                            value={permission}
                                            onChange={(e) => setPermission(e.target.value)}
                                        >
                                            <option value="view">View Only</option>
                                            <option value="edit">Allow Contributor Edit</option>
                                        </select>
                                    </div>
                                    <Button type="submit" size="sm" disabled={processing} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700">
                                        {processing ? 'Sharing...' : 'Confirm Share'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Remember This Modal */}
                {showRememberModal && (
                    <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-300">
                                <Bell className="h-4 w-4" /> Set Reminder for this Memory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <form onSubmit={handleRememberSubmit} className="flex flex-wrap items-end gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="remind_at" className="text-xs">Reminder Date</Label>
                                    <Input
                                        id="remind_at"
                                        type="date"
                                        value={remindAt}
                                        onChange={(e) => setRemindAt(e.target.value)}
                                        className="h-8 text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="recurrence" className="text-xs">Recurrence</Label>
                                    <select
                                        id="recurrence"
                                        className="h-8 rounded-md border border-input bg-transparent px-3 text-xs"
                                        value={recurrence}
                                        onChange={(e) => setRecurrence(e.target.value)}
                                    >
                                        <option value="yearly">Yearly Anniversary</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="none">One-time</option>
                                    </select>
                                </div>

                                <Button type="submit" size="sm" disabled={processing} className="h-8 text-xs bg-rose-600 hover:bg-rose-700">
                                    {processing ? 'Saving...' : 'Save Reminder'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" /> {entry.entry_date}
                            </span>
                            {entry.mood && (
                                <span className="flex items-center gap-1">
                                    <Smile className="h-3.5 w-3.5" /> Mood: {entry.mood}
                                </span>
                            )}
                            {entry.location_name && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" /> {entry.location_name}
                                </span>
                            )}
                            {entry.is_private && (
                                <span className="flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium">
                                    <Lock className="h-3 w-3" /> Private Memory
                                </span>
                            )}
                        </div>

                        <CardTitle className="text-2xl font-bold">{entry.title}</CardTitle>
                        {entry.owner && (
                            <p className="text-xs text-muted-foreground">By {entry.owner.name}</p>
                        )}
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none space-y-4">
                            {entry.blocks?.map((block) => (
                                <div key={block.id} className="whitespace-pre-wrap leading-relaxed text-sm">
                                    {block.content?.text}
                                </div>
                            ))}
                        </div>

                        {/* Photos Section */}
                        {entry.media && entry.media.length > 0 && (
                            <div className="space-y-2 border-t pt-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attached Photos</h3>
                                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                                    {entry.media.map((m) => (
                                        <div key={m.id} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                                            <img
                                                src={`/media/${m.id}/file`}
                                                alt={m.original_filename}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reminders list */}
                        {entry.reminders && entry.reminders.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1">
                                    <Bell className="h-3.5 w-3.5" /> Active Reminders
                                </h3>
                                <div className="space-y-1 text-xs">
                                    {entry.reminders.map((r) => (
                                        <div key={r.id} className="flex justify-between py-1 bg-muted/40 px-3 rounded">
                                            <span className="font-medium">{r.title}</span>
                                            <span className="text-muted-foreground">{r.remind_at} ({r.recurrence})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sharing management list */}
                        {entry.shares && entry.shares.length > 0 && (
                            <div className="border-t pt-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                                    <Share2 className="h-3.5 w-3.5" /> Active Shares
                                </h3>
                                <div className="space-y-2 text-xs">
                                    {entry.shares.map((share) => (
                                        <div key={share.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-muted/30">
                                            <div>
                                                <span className="font-medium">{share.target_user?.name ?? 'Partner'}</span>
                                                <span className="text-muted-foreground ml-2 capitalize">({share.permission})</span>
                                                {share.starts_at && <span className="text-[11px] text-muted-foreground ml-2">From: {share.starts_at}</span>}
                                                {share.ends_at && <span className="text-[11px] text-muted-foreground ml-2">Until: {share.ends_at}</span>}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevokeShare(share.id)}
                                                className="h-6 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

JournalShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journal', href: '/journal' },
        { title: 'View Memory', href: '#' },
    ],
};
