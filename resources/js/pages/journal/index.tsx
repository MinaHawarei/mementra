import { Head, Link } from '@inertiajs/react';
import { BookOpen, Plus, Calendar, MapPin, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function JournalIndex({ entries }: JournalIndexProps) {
    return (
        <>
            <Head title="Journal" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Memory Journal</h1>
                        <p className="text-sm text-muted-foreground">Preserve and revisit your written stories.</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/journal/create">
                            <Plus className="h-4 w-4" /> New Entry
                        </Link>
                    </Button>
                </div>

                {entries.data.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4 stroke-1" />
                        <CardTitle className="text-lg font-semibold">No journal entries yet</CardTitle>
                        <CardDescription className="max-w-xs mt-1 mb-4">
                            Start documenting your personal or shared moments.
                        </CardDescription>
                        <Button asChild>
                            <Link href="/journal/create">Write your first entry</Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {entries.data.map((entry) => {
                            const firstTextBlock = entry.blocks?.find((b) => b.type === 'text');
                            const excerpt = firstTextBlock?.content?.text ?? '';

                            return (
                                <Card key={entry.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> {entry.entry_date}
                                            </span>
                                            {entry.is_private && (
                                                <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px]">Private</span>
                                            )}
                                        </div>
                                        <CardTitle className="line-clamp-1 text-lg">
                                            <Link href={`/journal/${entry.id}`} className="hover:underline">
                                                {entry.title}
                                            </Link>
                                        </CardTitle>
                                        {excerpt && (
                                            <CardDescription className="line-clamp-3 text-xs mt-2">
                                                {excerpt}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                                            <div className="flex items-center gap-2">
                                                {entry.mood && (
                                                    <span className="flex items-center gap-1">
                                                        <Smile className="h-3.5 w-3.5" /> {entry.mood}
                                                    </span>
                                                )}
                                                {entry.location_name && (
                                                    <span className="flex items-center gap-1 line-clamp-1">
                                                        <MapPin className="h-3.5 w-3.5" /> {entry.location_name}
                                                    </span>
                                                )}
                                            </div>
                                            <Button asChild size="sm" variant="ghost">
                                                <Link href={`/journal/${entry.id}`}>View</Link>
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
        { title: 'Journal', href: '/journal' },
    ],
};
