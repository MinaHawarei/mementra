import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Images, Filter, ArrowUpRight, Download, Cloud, Check, Loader2, ImageOff, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MediaItem {
    id: number;
    type: string;
    original_filename: string;
    provider_file_id: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;
    url?: string;
    download_url?: string;
    is_owner?: boolean;
    user_id?: number;
    journal_entry_id?: number;
    journal_entry?: {
        id: number;
        title: string;
        entry_date: string;
    };
}

interface MemoriesIndexProps {
    mediaItems: {
        data: MediaItem[];
    };
    hasGoogleDrive?: boolean;
    savedMediaIds?: number[];
    filters?: {
        year?: string;
    };
}

export default function MemoriesIndex({ mediaItems, hasGoogleDrive = false, savedMediaIds = [], filters }: MemoriesIndexProps) {
    const [savingId, setSavingId] = useState<number | null>(null);
    const [savedList, setSavedList] = useState<number[]>(savedMediaIds);
    const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    const handleYearFilter = (year: string) => {
        router.get('/memories', year ? { year } : {}, { preserveState: true });
    };

    const handleSaveToDrive = (media: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!hasGoogleDrive) {
            if (confirm('You need to connect your personal Google Drive account first. Go to Settings -> Integrations now?')) {
                router.get('/settings/integrations');
            }
            return;
        }

        setSavingId(media.id);
        router.post(
            `/media/${media.id}/save-to-drive`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSavedList((prev) => [...prev, media.id]);
                },
                onFinish: () => {
                    setSavingId(null);
                },
            }
        );
    };

    const handleDownload = (media: MediaItem, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(media.download_url || `/media/${media.id}/download`, '_blank');
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
                {/* Header */}
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
                                    {items.map((m) => {
                                        const isSaved = savedList.includes(m.id);
                                        const isSaving = savingId === m.id;
                                        const hasError = imageErrors[m.id];
                                        const mediaUrl = m.url || `/media/${m.id}/file`;

                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => !hasError && setPreviewMedia(m)}
                                                className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                                            >
                                                {hasError ? (
                                                    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 p-2 text-center text-muted-foreground">
                                                        <ImageOff className="h-6 w-6 mb-1 text-muted-foreground/60" />
                                                        <span className="text-[10px] truncate max-w-[90%]">{m.original_filename}</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={mediaUrl}
                                                        alt={m.original_filename}
                                                        loading="lazy"
                                                        onError={() => setImageErrors((prev) => ({ ...prev, [m.id]: true }))}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                )}

                                                {/* Top action overlay on hover */}
                                                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDownload(m, e)}
                                                        title="Download photo"
                                                        className="h-7 w-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow-xs transition-transform active:scale-95"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </button>

                                                    {!m.is_owner && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleSaveToDrive(m, e)}
                                                            disabled={isSaved || isSaving}
                                                            title={isSaved ? 'Saved in My Drive' : 'Save copy to My Drive'}
                                                            className={`h-7 px-2 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-xs transition-all active:scale-95 ${
                                                                isSaved
                                                                    ? 'bg-emerald-600 text-white'
                                                                    : 'bg-black/75 hover:bg-black text-white'
                                                            }`}
                                                        >
                                                            {isSaving ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : isSaved ? (
                                                                <>
                                                                    <Check className="h-3 w-3" />
                                                                    <span>Saved</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Cloud className="h-3 w-3" />
                                                                    <span>Save</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Bottom details overlay */}
                                                {m.journal_entry_id && (
                                                    <Link
                                                        href={`/journal/${m.journal_entry_id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Media Lightbox / Preview Dialog */}
            {previewMedia && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
                    onClick={() => setPreviewMedia(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewMedia(null)}
                            className="absolute -top-10 right-0 text-white hover:text-white/80"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <img
                            src={previewMedia.url || `/media/${previewMedia.id}/file`}
                            alt={previewMedia.original_filename}
                            className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
                        />

                        <div className="mt-3 flex items-center justify-between w-full text-white text-xs px-2">
                            <span className="truncate max-w-xs">{previewMedia.original_filename}</span>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleDownload(previewMedia, e)}
                                    className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1.5"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                </Button>

                                {!previewMedia.is_owner && (
                                    <Button
                                        size="sm"
                                        onClick={(e) => handleSaveToDrive(previewMedia, e)}
                                        disabled={savedList.includes(previewMedia.id) || savingId === previewMedia.id}
                                        className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                                    >
                                        {savingId === previewMedia.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : savedList.includes(previewMedia.id) ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span>Saved in My Drive</span>
                                            </>
                                        ) : (
                                            <>
                                                <Cloud className="h-3.5 w-3.5" />
                                                <span>Save to My Drive</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

MemoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memories Gallery', href: '/memories' },
    ],
};
