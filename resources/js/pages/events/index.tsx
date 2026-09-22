import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Calendar, Plus, Trash, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EventsIndexProps {
    events: Array<{
        id: number;
        title: string;
        description?: string;
        event_date: string;
        recurrence: string;
    }>;
}

export default function EventsIndex({ events = [] }: EventsIndexProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        event_date: '',
        recurrence: 'none',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/events', {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this event?')) {
            router.delete(`/events/${id}`);
        }
    };

    return (
        <>
            <Head title="Events &amp; Milestones — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Events &amp; Milestones</h1>
                    <p className="text-sm text-muted-foreground">
                        Honor the anniversaries, travels, and occasions that define your journey.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Add Event Form */}
                    <Card className="md:col-span-1 border-border/80 bg-card shadow-xs">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Plus className="h-4 w-4 text-indigo-500" />
                                <span>Add Event</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Never miss a special date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. First Anniversary"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="h-9 text-xs rounded-xl"
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="event_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Date
                                    </Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="h-9 text-xs rounded-xl"
                                        required
                                    />
                                    {errors.event_date && <p className="text-xs text-destructive">{errors.event_date}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="recurrence" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Recurrence
                                    </Label>
                                    <select
                                        id="recurrence"
                                        className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-xs"
                                        value={data.recurrence}
                                        onChange={(e) => setData('recurrence', e.target.value)}
                                    >
                                        <option value="none">One-time event</option>
                                        <option value="yearly">Repeats Yearly (Anniversary)</option>
                                        <option value="monthly">Repeats Monthly</option>
                                        <option value="weekly">Repeats Weekly</option>
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs"
                                >
                                    {processing ? 'Saving...' : 'Save Event'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Events List */}
                    <Card className="md:col-span-2 border-border/80 bg-card shadow-xs">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-amber-500" />
                                <span>Saved Milestones</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Your registered dates across time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                                    <Calendar className="mx-auto h-8 w-8 stroke-1 text-muted-foreground/60" />
                                    <p>No events recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {events.map((evt) => (
                                        <div
                                            key={evt.id}
                                            className="flex items-center justify-between border border-border/60 rounded-xl p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-foreground">{evt.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span className="font-mono">{evt.event_date}</span>
                                                        {evt.recurrence !== 'none' && (
                                                            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-medium capitalize">
                                                                {evt.recurrence}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(evt.id)}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
    ],
};
