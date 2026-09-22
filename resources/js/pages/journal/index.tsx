import { Head, Link } from '@inertiajs/react';
import { BookOpen, Plus, Calendar, MapPin, Smile, Lock, Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface JournalIndexProps {
    entries: {
        data: Array<{
            id: number;
            title: string;
            entry_date: string;
            mood?: string;
            location_name?: string;
            is_private: boolean;
            blocks?: Array<{ id: number; type: string; content?: { text?: string } }>;
        }>;
    };
}

const moodEmojis: Record<string, { emoji: string; label: string; border: string; badge: string }> = {
    happy: { emoji: '😊', label: 'Happy', border: 'border-t-amber-400', badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
    loved: { emoji: '❤️', label: 'Loved', border: 'border-t-rose-500', badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
    grateful: { emoji: '🙏', label: 'Grateful', border: 'border-t-emerald-400', badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
    calm: { emoji: '🌿', label: 'Calm', border: 'border-t-teal-400', badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20' },
    nostalgic: { emoji: '🌅', label: 'Nostalgic', border: 'border-t-indigo-500', badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
    thoughtful: { emoji: '💭', label: 'Thoughtful', border: 'border-t-purple-400', badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
    excited: { emoji: '🎉', label: 'Excited', border: 'border-t-orange-400', badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20' },
    sad: { emoji: '🌧️', label: 'Reflective', border: 'border-t-blue-400', badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' },
};

export default function JournalIndex({ entries }: JournalIndexProps) {
    const [search, setSearch] = useState('');

    const filteredEntries = entries.data.filter((entry) => {
        const query = search.toLowerCase();
        const titleMatch = entry.title?.toLowerCase().includes(query);
        const locationMatch = entry.location_name?.toLowerCase().includes(query);
        const textBlock = entry.blocks?.find((b) => b.type === 'text');
        const textMatch = textBlock?.content?.text?.toLowerCase().includes(query);
        return titleMatch || locationMatch || textMatch;
    });

    return (
        <>
            <Head title="Memory Journal — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Living Journal</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Preserve your heartfelt stories, milestones, and reflections.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search memories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 text-xs rounded-xl bg-card"
                            />
                        </div>

                        <Button asChild className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-indigo-500/25">
                            <Link href="/journal/create">
                                <Plus className="me-1.5 h-4 w-4" />
                                <span>Write Memory</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Content Grid / Empty State */}
                {entries.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-border bg-card/60">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <BookOpen className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No journal memories yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                            Start documenting your personal reflections or shared moments together.
                        </p>
                        <Button asChild className="bg-primary text-primary-foreground">
                            <Link href="/journal/create">
                                <Plus className="me-1.5 h-4 w-4" />
                                <span>Write your first entry</span>
                            </Link>
                        </Button>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        No memories found matching &ldquo;{search}&rdquo;.
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEntries.map((entry) => {
                            const moodKey = entry.mood ? entry.mood.toLowerCase() : '';
                            const mood = moodEmojis[moodKey];
                            const firstTextBlock = entry.blocks?.find((b) => b.type === 'text');
                            const excerpt = firstTextBlock?.content?.text ?? '';

                            return (
                                <Card
                                    key={entry.id}
                                    className={`group flex flex-col justify-between border-border/70 border-t-4 ${mood?.border ?? 'border-t-indigo-500'} bg-card transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                            <span className="flex items-center gap-1 font-mono">
                                                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                                <span>{entry.entry_date}</span>
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {mood && (
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${mood.badge}`}>
                                                        <span>{mood.emoji}</span>
                                                        <span>{mood.label}</span>
                                                    </span>
                                                )}
                                                {entry.is_private && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                                        <Lock className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Link href={`/journal/${entry.id}`} className="group-hover:text-primary transition-colors">
                                            <CardTitle className="text-base font-bold line-clamp-1">
                                                {entry.title}
                                            </CardTitle>
                                        </Link>

                                        {entry.location_name && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground/80 mt-1">
                                                <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
                                                <span className="truncate">{entry.location_name}</span>
                                            </div>
                                        )}
                                    </CardHeader>

                                    <CardContent className="pt-0 flex flex-col justify-between flex-1">
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                                            {excerpt || 'No written text for this entry.'}
                                        </p>

                                        <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                                            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 dark:text-indigo-400 p-0 hover:bg-transparent hover:underline">
                                                <Link href={`/journal/${entry.id}`}>Read Story &rarr;</Link>
                                            </Button>

                                            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                                <Link href={`/journal/${entry.id}/edit`}>Edit</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

JournalIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memory Journal', href: '/journal' },
    ],
};

