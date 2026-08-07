import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Bell, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RemindersIndexProps {
    reminders: Array<{
        id: number;
        title: string;
        description?: string;
        remind_at: string;
        recurrence: string;
        is_active: boolean;
    }>;
}

export default function RemindersIndex({ reminders = [] }: RemindersIndexProps) {
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        remind_at: '',
        recurrence: 'none',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/reminders', {
            onSuccess: () => reset(),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this reminder?')) {
            router.delete(`/reminders/${id}`);
        }
    };

    return (
        <>
            <Head title="Reminders" />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
                    <p className="text-sm text-muted-foreground">Set notifications so you remember every important moment.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Set Reminder</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Reminder Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Buy anniversary gift"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remind_at">Remind At</Label>
                                    <Input
                                        id="remind_at"
                                        type="datetime-local"
                                        value={data.remind_at}
                                        onChange={(e) => setData('remind_at', e.target.value)}
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
                                        <option value="none">One-time</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    Save Reminder
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Active Reminders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reminders.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No active reminders.</p>
                            ) : (
                                <div className="space-y-3">
                                    {reminders.map((rem) => (
                                        <div key={rem.id} className="flex items-center justify-between border rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                                    <Bell className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{rem.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(rem.remind_at).toLocaleString()} {rem.recurrence !== 'none' && `• ${rem.recurrence}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(rem.id)}>
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

RemindersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reminders', href: '/reminders' },
    ],
};
