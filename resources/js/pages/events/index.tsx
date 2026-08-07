import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Calendar, Plus, Trash } from 'lucide-react';
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
    const { data, setData, post, processing, reset } = useForm({
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
            <Head title="Events & Anniversaries" />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Events & Anniversaries</h1>
                    <p className="text-sm text-muted-foreground">Keep track of important milestones, dates, and occasions.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Add Event Form */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Add Event</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Event Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. First Anniversary"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="event_date">Date</Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recurrence">Recurrence</Label>
                                    <select
                                        id="recurrence"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={data.recurrence}
                                        onChange={(e) => setData('recurrence', e.target.value)}
                                    >
                                        <option value="none">One-time event</option>
                                        <option value="yearly">Repeats Yearly</option>
                                        <option value="monthly">Repeats Monthly</option>
                                        <option value="weekly">Repeats Weekly</option>
                                    </select>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    Save Event
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Events List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Saved Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {events.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No events created yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {events.map((evt) => (
                                        <div key={evt.id} className="flex items-center justify-between border rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{evt.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {evt.event_date} {evt.recurrence !== 'none' && `• ${evt.recurrence}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(evt.id)}>
                                                <Trash className="h-4 w-4 text-red-500" />
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
