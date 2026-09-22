import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Bell, Plus, Trash, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    const { data, setData, post, processing, reset, errors } = useForm({
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
            <Head title="Gentle Reminders — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Gentle Reminders</h1>
                    <p className="text-sm text-muted-foreground">
                        Never let a meaningful anniversary or celebration slip away unnoticed.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Set Reminder Form */}
                    <Card className="md:col-span-1 border-border/80 bg-card shadow-xs">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Plus className="h-4 w-4 text-indigo-500" />
                                <span>Set Reminder</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Schedule an alert for upcoming moments.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Title
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Plan weekend getaway"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="h-9 text-xs rounded-xl"
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="remind_at" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Date
                                    </Label>
                                    <Input
                                        id="remind_at"
                                        type="date"
                                        value={data.remind_at}
                                        onChange={(e) => setData('remind_at', e.target.value)}
                                        className="h-9 text-xs rounded-xl"
                                        required
                                    />
                                    {errors.remind_at && <p className="text-xs text-destructive">{errors.remind_at}</p>}
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
                                        <option value="none">One-time alert</option>
                                        <option value="yearly">Repeats Yearly</option>
                                        <option value="monthly">Repeats Monthly</option>
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm text-xs"
                                >
                                    {processing ? 'Saving...' : 'Save Reminder'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Reminders List */}
                    <Card className="md:col-span-2 border-border/80 bg-card shadow-xs">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Bell className="h-4 w-4 text-indigo-500" />
                                <span>Active Reminders</span>
                            </CardTitle>
                            <CardDescription className="text-xs">Your registered prompts across time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reminders.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
                                    <Bell className="mx-auto h-8 w-8 stroke-1 text-muted-foreground/60" />
                                    <p>No reminders configured yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {reminders.map((rem) => (
                                        <div
                                            key={rem.id}
                                            className="flex items-center justify-between border border-border/60 rounded-xl p-3.5 bg-muted/20 hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                    <Bell className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-foreground">{rem.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span className="font-mono">
                                                            {new Date(rem.remind_at).toLocaleDateString()}
                                                        </span>
                                                        {rem.recurrence !== 'none' && (
                                                            <span className="rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-medium capitalize">
                                                                {rem.recurrence}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(rem.id)}
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

RemindersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reminders', href: '/reminders' },
    ],
};
