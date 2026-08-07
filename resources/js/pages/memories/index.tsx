import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Images, Filter } from 'lucide-react';
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
    const groupedMedia = mediaItems.data.reduce((acc, item) => {
        const dateObj = new Date(item.created_at);
        const key = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, typeof mediaItems.data>);

    return (
        <>
            <Head title="Memories Gallery" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Memories Gallery</h1>
                        <p className="text-sm text-muted-foreground">All photos and media attached to your story, organized chronologically.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-xs"
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

                {mediaItems.data.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <Images className="h-12 w-12 text-muted-foreground mb-4 stroke-1" />
                        <CardTitle className="text-lg font-semibold">No media in your gallery yet</CardTitle>
                        <CardDescription className="max-w-xs mt-1">
                            Media attached to your journal entries will automatically appear here.
                        </CardDescription>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedMedia).map(([groupTitle, items]) => (
                            <div key={groupTitle} className="space-y-4">
                                <h2 className="text-base font-semibold border-b pb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-rose-500" /> {groupTitle}
                                </h2>
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {items.map((item) => (
                                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                            <div className="aspect-square bg-muted relative overflow-hidden">
                                                <img
                                                    src={`/media/${item.id}/file`}
                                                    alt={item.original_filename}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        // Fallback icon if image fails to load
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-muted -z-10">
                                                    <Images className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                            </div>
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-xs truncate">{item.original_filename}</CardTitle>
                                                {item.journal_entry ? (
                                                    <CardDescription className="text-[11px] truncate">
                                                        <Link href={`/journal/${item.journal_entry.id}`} className="hover:underline text-rose-600 font-medium">
                                                            {item.journal_entry.title}
                                                        </Link>
                                                    </CardDescription>
                                                ) : (
                                                    <CardDescription className="text-[10px]">
                                                        {(item.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                        </Card>
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
