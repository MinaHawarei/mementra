import { Head, Link } from '@inertiajs/react';
import { Bell, BookOpen, Calendar, Heart, Plus, Sparkles } from 'lucide-react';
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

export default function Dashboard({ relationship, recentEntries = [], upcomingEvents = [], upcomingReminders = [] }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Relationship Banner */}
                <Card className="border-rose-100 bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-amber-50/20 dark:border-rose-950 dark:from-rose-950/20 dark:to-zinc-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                                <Heart className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    {relationship ? relationship.name : 'Your Personal Space'}
                                </CardTitle>
                                <CardDescription>
                                    {relationship
                                        ? `Connected with ${relationship.members?.find((m) => m.name)?.name ?? 'your partner'}`
                                        : 'Connect with a partner or preserve your personal memory journal.'}
                                </CardDescription>
                            </div>
                        </div>
                        <Button asChild size="sm" variant={relationship ? 'outline' : 'default'} className="bg-rose-600 hover:bg-rose-700 text-white">
                            <Link href="/relationship">
                                {relationship ? 'Manage Connection' : 'Connect Partner'}
                            </Link>
                        </Button>
                    </CardHeader>
                </Card>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Button asChild variant="outline" className="h-20 justify-start gap-4 p-4 text-left">
                        <Link href="/journal/create">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold">Write a Memory</div>
                                <div className="text-xs text-muted-foreground">Capture today's story</div>
                            </div>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-20 justify-start gap-4 p-4 text-left">
                        <Link href="/events">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold">Add Event</div>
                                <div className="text-xs text-muted-foreground">Mark a special date</div>
                            </div>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="h-20 justify-start gap-4 p-4 text-left">
                        <Link href="/reminders">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold">Set Reminder</div>
                                <div className="text-xs text-muted-foreground">Never forget a moment</div>
                            </div>
                        </Link>
                    </Button>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Recent Journal Entries */}
                    <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Recent Memories</CardTitle>
                                <CardDescription>Your latest journal entries</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/journal">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <BookOpen className="h-10 w-10 mb-2 stroke-1" />
                                    <p className="text-sm">No memories recorded yet.</p>
                                    <Button asChild size="sm" variant="link" className="mt-2">
                                        <Link href="/journal/create">Write your first memory</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentEntries.map((entry) => (
                                        <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                                            <div>
                                                <Link href={`/journal/${entry.id}`} className="font-medium hover:underline">
                                                    {entry.title}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{entry.entry_date}</span>
                                                    {entry.mood && <span>• Mood: {entry.mood}</span>}
                                                    {entry.location_name && <span>• {entry.location_name}</span>}
                                                </div>
                                            </div>
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/journal/${entry.id}`}>Read</Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming Events */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-amber-500" /> Upcoming Events
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No upcoming events.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {upcomingEvents.map((evt) => (
                                            <div key={evt.id} className="flex justify-between text-xs">
                                                <span className="font-medium">{evt.title}</span>
                                                <span className="text-muted-foreground">{evt.event_date}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Reminders */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-emerald-500" /> Due Reminders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingReminders.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No active reminders.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {upcomingReminders.map((rem) => (
                                            <div key={rem.id} className="flex justify-between text-xs">
                                                <span className="font-medium">{rem.title}</span>
                                                <span className="text-muted-foreground">{new Date(rem.remind_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
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
