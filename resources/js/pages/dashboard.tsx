import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, BookOpen, Calendar, Heart, Plus, Sparkles, Clock, ArrowRight, MapPin, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

interface DashboardProps {
    relationship?: {
        id: number;
        name: string;
        type: string;
        status: string;
        connected_at?: string;
        members: Array<{ id: number; name: string; email: string }>;
    };
    recentEntries: Array<{
        id: number;
        title: string;
        entry_date: string;
        mood?: string;
        location_name?: string;
    }>;
    upcomingEvents: Array<{
        id: number;
        title: string;
        event_date: string;
    }>;
    upcomingReminders: Array<{
        id: number;
        title: string;
        remind_at: string;
    }>;
}

const moodEmojis: Record<string, { emoji: string; label: string; color: string }> = {
    happy: { emoji: '😊', label: 'Happy', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    loved: { emoji: '❤️', label: 'Loved', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
    grateful: { emoji: '🙏', label: 'Grateful', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    calm: { emoji: '🌿', label: 'Calm', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20' },
    nostalgic: { emoji: '🌅', label: 'Nostalgic', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
    thoughtful: { emoji: '💭', label: 'Thoughtful', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
    excited: { emoji: '🎉', label: 'Excited', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
    sad: { emoji: '🌧️', label: 'Reflective', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
};

export default function Dashboard({
    relationship,
    recentEntries = [],
    upcomingEvents = [],
    upcomingReminders = []
}: DashboardProps) {
    const { auth } = usePage().props as { auth?: { user?: { name: string } } };
    const userName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'there';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <>
            <Head title="Dashboard — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Hero Greeting & Space Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-indigo-500/5 p-6 sm:p-8 shadow-xs">
                    <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>{relationship ? relationship.name : 'Your Personal Sanctuary'}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {getGreeting()}, {userName}.
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-xl">
                                {relationship
                                    ? `Connected with ${relationship.members?.find((m) => m.name !== auth?.user?.name)?.name ?? 'your partner'}. Every moment recorded is a treasure preserved.`
                                    : 'A quiet space to record your thoughts, celebrate milestones, and preserve what matters most.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-indigo-500/20">
                                <Link href="/journal/create">
                                    <Plus className="me-1.5 h-4 w-4" />
                                    <span>Write Memory</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-border hover:bg-accent/50">
                                <Link href="/relationship">
                                    <Heart className="me-1.5 h-4 w-4 text-purple-500" />
                                    <span>{relationship ? 'Our Story' : 'Connect Partner'}</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Link
                        href="/journal/create"
                        className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground text-sm">Write a Memory</div>
                            <div className="text-xs text-muted-foreground truncate">Capture today&apos;s story &amp; photos</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>

                    <Link
                        href="/events"
                        className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-amber-500/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground text-sm">Milestones &amp; Events</div>
                            <div className="text-xs text-muted-foreground truncate">Mark important dates</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>

                    <Link
                        href="/timeline"
                        className="group relative flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-purple-500/40 hover:shadow-md hover:-translate-y-0.5"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground text-sm">Living Timeline</div>
                            <div className="text-xs text-muted-foreground truncate">Trace your shared journey</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column: Recent Journal Entries */}
                    <Card className="lg:col-span-2 border-border/80 shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-base font-bold tracking-tight">Recent Memories</CardTitle>
                                <CardDescription className="text-xs">Your latest stories and reflections</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                                <Link href="/journal">View All Memories &rarr;</Link>
                            </Button>
                        </CardHeader>

                        <CardContent>
                            {recentEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl p-6">
                                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <p className="font-medium text-foreground text-sm">No memories recorded yet</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                        Every beautiful memory begins with a single line. Capture a feeling, a thought, or an event.
                                    </p>
                                    <Button asChild size="sm" className="mt-4 bg-primary text-primary-foreground">
                                        <Link href="/journal/create">Write your first memory</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentEntries.map((entry) => {
                                        const moodInfo = entry.mood ? moodEmojis[entry.mood.toLowerCase()] : null;
                                        return (
                                            <div
                                                key={entry.id}
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 p-4 transition-all duration-200 hover:bg-muted/40 hover:border-indigo-500/30"
                                            >
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Link
                                                            href={`/journal/${entry.id}`}
                                                            className="font-semibold text-foreground hover:text-primary transition-colors truncate text-sm"
                                                        >
                                                            {entry.title}
                                                        </Link>
                                                        {moodInfo && (
                                                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${moodInfo.color}`}>
                                                                <span>{moodInfo.emoji}</span>
                                                                <span>{moodInfo.label}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>{entry.entry_date}</span>
                                                        {entry.location_name && (
                                                            <span className="flex items-center gap-1 truncate">
                                                                <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                                                                <span className="truncate">{entry.location_name}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button asChild size="sm" variant="ghost" className="self-end sm:self-center text-xs">
                                                    <Link href={`/journal/${entry.id}`}>Read Story &rarr;</Link>
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column: Events & Reminders */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-amber-500" />
                                    <span>Upcoming Dates</span>
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                                    <Link href="/events">View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-muted-foreground">
                                        <p>No upcoming events.</p>
                                        <Button asChild variant="link" size="sm" className="text-xs mt-1 text-primary">
                                            <Link href="/events">+ Add special date</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {upcomingEvents.map((evt) => (
                                            <div
                                                key={evt.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-xs"
                                            >
                                                <span className="font-medium text-foreground truncate">{evt.title}</span>
                                                <span className="text-muted-foreground shrink-0 ms-2 font-mono">{evt.event_date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Due Reminders */}
                        <Card className="border-border/80 shadow-xs">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-indigo-500" />
                                    <span>Active Reminders</span>
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                                    <Link href="/reminders">View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {upcomingReminders.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-muted-foreground">
                                        <p>No active reminders.</p>
                                        <Button asChild variant="link" size="sm" className="text-xs mt-1 text-primary">
                                            <Link href="/reminders">+ Create reminder</Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {upcomingReminders.map((rem) => (
                                            <div
                                                key={rem.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-xs"
                                            >
                                                <span className="font-medium text-foreground truncate">{rem.title}</span>
                                                <span className="text-muted-foreground shrink-0 ms-2 font-mono">
                                                    {new Date(rem.remind_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Memory Book Promo */}
                        <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-5 text-xs text-foreground space-y-2">
                            <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
                                <Sparkles className="h-4 w-4" />
                                <span>Export Memory Book</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Turn your shared entries into an elegant PDF keepsake anytime.
                            </p>
                            <Button asChild size="sm" variant="outline" className="w-full text-xs mt-2 border-indigo-500/30">
                                <Link href="/exports">Explore Exports &rarr;</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};



