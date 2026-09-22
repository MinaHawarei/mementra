import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Images, Filter, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MemoriesIndexProps {
    mediaItems: {
        data: Array<{
            id: number;
            type: string;
            original_filename: string;
            provider_file_id: string;
            mime_type: string;
            size_bytes: number;
            created_at: string;
            journal_entry_id?: number;
            journal_entry?: {
                id: number;
                title: string;
                entry_date: string;
            };
        }>;
    };
    filters?: {
        year?: string;
    };
}

export default function MemoriesIndex({ mediaItems, filters }: MemoriesIndexProps) {
    const handleYearFilter = (year: string) => {
        router.get('/memories', year ? { year } : {}, { preserveState: true });
    };

    // Group media items by Year and Month
    const groupedMedia = (mediaItems?.data ?? []).reduce((acc, item) => {
        const dateObj = new Date(item.created_at);
        const key = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, typeof mediaItems.data>);

    const hasMedia = mediaItems?.data && mediaItems.data.length > 0;

    return (
        <>
            <Head title="Photo Memories — Mementra" />
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Photo Gallery</h1>
                        <p className="text-sm text-muted-foreground">
                            Visual keepsakes attached to your written memories, arranged chronologically.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            className="h-9 rounded-xl border border-input bg-card px-3 text-xs shadow-xs"
                            value={filters?.year ?? ''}
                            onChange={(e) => handleYearFilter(e.target.value)}
                        >
                            <option value="">All Years</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                </div>

                {!hasMedia ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-border bg-card/60">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <Images className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No photos preserved yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-6">
                            Attach images to your journal entries to see your photo sanctuary come to life.
                        </p>
                        <Button asChild className="bg-primary text-primary-foreground">
                            <Link href="/journal/create">Write an entry with photos</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(groupedMedia).map(([monthGroup, items]) => (
                            <div key={monthGroup} className="space-y-4">
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{monthGroup}</span>
                                </div>

                                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {items.map((m) => (
                                        <div
                                            key={m.id}
                                            className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            <img
                                                src={`/media/${m.id}/file`}
                                                alt={m.original_filename}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            {m.journal_entry_id && (
                                                <Link
                                                    href={`/journal/${m.journal_entry_id}`}
                                                    className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="text-xs font-medium truncate flex items-center justify-between">
                                                        <span>{m.journal_entry?.title || 'View Entry'}</span>
                                                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                                                    </span>
                                                    <span className="text-[10px] text-white/80 font-mono">
                                                        {m.journal_entry?.entry_date}
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

MemoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memories Gallery', href: '/memories' },
    ],
};
