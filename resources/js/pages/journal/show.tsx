import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Bell, Calendar, Edit, Lock, MapPin, Share2, Smile, Trash, X, Sparkles, Image as ImageIcon } from 'lucide-react';
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

const moodEmojis: Record<string, { emoji: string; label: string; badge: string }> = {
    happy: { emoji: '😊', label: 'Happy', badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    loved: { emoji: '❤️', label: 'Loved', badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
    grateful: { emoji: '🙏', label: 'Grateful', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    calm: { emoji: '🌿', label: 'Calm', badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20' },
    nostalgic: { emoji: '🌅', label: 'Nostalgic', badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
    thoughtful: { emoji: '💭', label: 'Thoughtful', badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
    excited: { emoji: '🎉', label: 'Excited', badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
    sad: { emoji: '🌧️', label: 'Reflective', badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
};

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

    const moodKey = entry.mood ? entry.mood.toLowerCase() : '';
    const mood = moodEmojis[moodKey];

    const handleDelete = () => {
        if (confirm('Are you sure you wish to delete this cherished memory? This action cannot be undone.')) {
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
            <Head title={`${entry.title} — Mementra`} />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                {/* Action Navigation Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 self-start text-muted-foreground hover:text-foreground">
                        <Link href="/journal">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Journal</span>
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        {partner && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowShareModal(!showShareModal)}
                                className="gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                <span>Share Memory</span>
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowRememberModal(!showRememberModal)}
                            className="gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        >
                            <Bell className="h-3.5 w-3.5" />
                            <span>Remember This</span>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs border-border">
                            <Link href={`/journal/${entry.id}/edit`}>
                                <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Edit</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                        >
                            <Trash className="h-3.5 w-3.5" />
                            <span>Delete</span>
                        </Button>
                    </div>
                </div>

                {/* Inline Share Modal */}
                {showShareModal && partner && (
                    <Card className="border-indigo-500/30 bg-indigo-500/5 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                    <Share2 className="h-4 w-4" />
                                    <span>Share with {partner.name}</span>
                                </CardTitle>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <form onSubmit={handleShareSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="starts_at" className="text-xs">Access Start Date (Optional)</Label>
                                        <Input
                                            id="starts_at"
                                            type="date"
                                            value={startsAt}
                                            onChange={(e) => setStartsAt(e.target.value)}
                                            className="h-8 text-xs rounded-lg"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="ends_at" className="text-xs">Access End Date (Optional)</Label>
                                        <Input
                                            id="ends_at"
                                            type="date"
                                            value={endsAt}
                                            onChange={(e) => setEndsAt(e.target.value)}
                                            className="h-8 text-xs rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="permission" className="text-xs">Permission:</Label>
                                        <select
                                            id="permission"
                                            className="h-8 rounded-lg border border-input bg-background px-3 text-xs"
                                            value={permission}
                                            onChange={(e) => setPermission(e.target.value)}
                                        >
                                            <option value="view">View Only</option>
                                            <option value="edit">Allow Partner Edits</option>
                                        </select>
                                    </div>
                                    <Button type="submit" size="sm" disabled={processing} className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                        {processing ? 'Sharing...' : 'Confirm Share'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Inline Remember This Modal */}
                {showRememberModal && (
                    <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                    <Bell className="h-4 w-4" />
                                    <span>Set a Future Reminder for this Memory</span>
                                </CardTitle>
                                <button
                                    onClick={() => setShowRememberModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <form onSubmit={handleRememberSubmit} className="flex flex-wrap items-end gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="remind_at" className="text-xs">Remind Date</Label>
                                    <Input
                                        id="remind_at"
                                        type="date"
                                        value={remindAt}
                                        onChange={(e) => setRemindAt(e.target.value)}
                                        className="h-8 text-xs rounded-lg"
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="recurrence" className="text-xs">Recurrence</Label>
                                    <select
                                        id="recurrence"
                                        className="h-8 rounded-lg border border-input bg-background px-3 text-xs"
                                        value={recurrence}
                                        onChange={(e) => setRecurrence(e.target.value)}
                                    >
                                        <option value="yearly">Yearly Anniversary</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="none">One-time</option>
                                    </select>
                                </div>

                                <Button type="submit" size="sm" disabled={processing} className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white">
                                    {processing ? 'Saving...' : 'Save Reminder'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Main Article Container */}
                <article className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-xs space-y-8">
                    {/* Header Metadata */}
                    <div className="space-y-4 border-b border-border/50 pb-6">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-mono">
                                <Calendar className="h-4 w-4 text-indigo-400" />
                                <span>{entry.entry_date}</span>
                            </span>

                            {mood && (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${mood.badge}`}>
                                    <span>{mood.emoji}</span>
                                    <span>{mood.label}</span>
                                </span>
                            )}

                            {entry.location_name && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-indigo-400" />
                                    <span>{entry.location_name}</span>
                                </span>
                            )}

                            {entry.is_private && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 text-xs font-medium">
                                    <Lock className="h-3 w-3" />
                                    <span>Private Memory</span>
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                            {entry.title}
                        </h1>

                        {entry.owner && (
                            <p className="text-xs text-muted-foreground">
                                Recorded by <span className="font-medium text-foreground">{entry.owner.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Story Content Blocks */}
                    <div className="prose dark:prose-invert max-w-none text-base leading-relaxed space-y-4 text-foreground/90">
                        {entry.blocks && entry.blocks.length > 0 ? (
                            entry.blocks.map((block) => (
                                <div key={block.id} className="whitespace-pre-wrap leading-relaxed">
                                    {block.content?.text}
                                </div>
                            ))
                        ) : (
                            <p className="italic text-muted-foreground text-sm">No written text recorded for this entry.</p>
                        )}
                    </div>

                    {/* Attached Photos Gallery */}
                    {entry.media && entry.media.length > 0 && (
                        <div className="border-t border-border/50 pt-6 space-y-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Attached Photos ({entry.media.length})</span>
                            </h3>
                            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                                {entry.media.map((m) => (
                                    <div
                                        key={m.id}
                                        className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-xs"
                                    >
                                        <img
                                            src={`/media/${m.id}/file`}
                                            alt={m.original_filename}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Reminders & Active Shares Lists */}
                    {((entry.reminders && entry.reminders.length > 0) || (entry.shares && entry.shares.length > 0)) && (
                        <div className="border-t border-border/50 pt-6 space-y-6">
                            {entry.reminders && entry.reminders.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                        <Bell className="h-3.5 w-3.5" />
                                        <span>Active Reminders</span>
                                    </h3>
                                    <div className="space-y-1.5">
                                        {entry.reminders.map((r) => (
                                            <div
                                                key={r.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 text-xs"
                                            >
                                                <span className="font-medium text-foreground">{r.title}</span>
                                                <span className="text-muted-foreground font-mono">{r.remind_at} ({r.recurrence})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {entry.shares && entry.shares.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                                        <span>Shared Access</span>
                                    </h3>
                                    <div className="space-y-1.5">
                                        {entry.shares.map((share) => (
                                            <div
                                                key={share.id}
                                                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 text-xs"
                                            >
                                                <div>
                                                    <span className="font-medium text-foreground">{share.target_user?.name ?? 'Partner'}</span>
                                                    <span className="text-muted-foreground ms-2 capitalize">({share.permission})</span>
                                                    {share.starts_at && <span className="text-[11px] text-muted-foreground ml-2">From: {share.starts_at}</span>}
                                                    {share.ends_at && <span className="text-[11px] text-muted-foreground ml-2">Until: {share.ends_at}</span>}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRevokeShare(share.id)}
                                                    className="h-7 px-2 text-destructive hover:bg-destructive/10"
                                                >
                                                    Revoke
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </article>
            </div>
        </>
    );
}

JournalShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memory Journal', href: '/journal' },
        { title: 'View Memory', href: '#' },
    ],
};

