import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Image as ImageIcon,
    ImageOff,
    ImagePlus,
    Lock,
    MapPin,
    RotateCcw,
    Trash2,
    X,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    getBlockText,
    getMediaUrl,
    JournalBlockItem,
    MediaItem,
    normalizeList,
} from '@/lib/journal';

interface JournalEditProps {
    entry: {
        id: number;
        title: string;
        entry_date: string;
        location_name?: string;
        mood?: string;
        is_private: boolean;
        blocks?: JournalBlockItem[] | { data?: JournalBlockItem[] };
        media?: MediaItem[] | { data?: MediaItem[] };
    };
}

const moodOptions = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'loved', emoji: '❤️', label: 'Loved' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'calm', emoji: '🌿', label: 'Calm' },
    { value: 'nostalgic', emoji: '🌅', label: 'Nostalgic' },
    { value: 'thoughtful', emoji: '💭', label: 'Thoughtful' },
    { value: 'excited', emoji: '🎉', label: 'Excited' },
    { value: 'sad', emoji: '🌧️', label: 'Reflective' },
];

export default function JournalEdit({ entry }: JournalEditProps) {
    // Normalize blocks and existing media
    const rawBlocks = normalizeList<JournalBlockItem>(entry?.blocks);
    const initialExistingMedia = normalizeList<MediaItem>(entry?.media);

    // Extract initial text from existing text blocks
    const initialBodyText = rawBlocks
        .filter((b) => !b.type || b.type === 'text')
        .map((b) => getBlockText(b))
        .filter(Boolean)
        .join('\n\n');

    const [title, setTitle] = useState(entry?.title ?? '');
    const [entryDate, setEntryDate] = useState(entry?.entry_date ?? '');
    const [locationName, setLocationName] = useState(entry?.location_name ?? '');
    const [mood, setMood] = useState(entry?.mood ? entry.mood.toLowerCase() : 'happy');
    const [isPrivate, setIsPrivate] = useState(Boolean(entry?.is_private));
    const [bodyText, setBodyText] = useState(initialBodyText);

    // Existing media state & detachment tracking
    const [existingMedia, setExistingMedia] = useState<MediaItem[]>(initialExistingMedia);
    const [detachedMediaIds, setDetachedMediaIds] = useState<number[]>([]);

    // New images staging
    const [newImages, setNewImages] = useState<File[]>([]);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const [mediaFallbacks, setMediaFallbacks] = useState<Record<number, boolean>>({});
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resolveMediaSrc = (m: MediaItem): string => {
        if (mediaFallbacks[m.id]) {
            return `/media/${m.id}/file`;
        }
        return getMediaUrl(m);
    };

    const handleImageError = (mediaId: number) => {
        if (!mediaFallbacks[mediaId]) {
            setMediaFallbacks((prev) => ({ ...prev, [mediaId]: true }));
        } else {
            setImageErrors((prev) => ({ ...prev, [mediaId]: true }));
        }
    };

    const addImages = (files: FileList | null) => {
        if (!files) return;
        const incoming = Array.from(files);

        // Deduplication: prevent staging identical files already in newImages or existingMedia
        const deduplicated = incoming.filter((file) => {
            const alreadyInNew = newImages.some(
                (existingFile) => existingFile.name === file.name && existingFile.size === file.size
            );
            const alreadyInExisting = existingMedia.some(
                (m) => m.original_filename === file.name && (m.size_bytes === undefined || m.size_bytes === file.size)
            );
            return !alreadyInNew && !alreadyInExisting;
        });

        if (deduplicated.length > 0) {
            setNewImages((prev) => [...prev, ...deduplicated]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingMedia = (mediaId: number) => {
        const itemToRemove = existingMedia.find((m) => m.id === mediaId);
        if (!itemToRemove) return;

        setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
        setDetachedMediaIds((prev) => (prev.includes(mediaId) ? prev : [...prev, mediaId]));
    };

    const undoRemoveExistingMedia = (mediaId: number) => {
        const originalItem = initialExistingMedia.find((m) => m.id === mediaId);
        if (!originalItem) return;

        setDetachedMediaIds((prev) => prev.filter((id) => id !== mediaId));
        setExistingMedia((prev) => [...prev, originalItem]);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', title);
        formData.append('entry_date', entryDate);
        formData.append('location_name', locationName);
        formData.append('mood', mood);
        formData.append('is_private', isPrivate ? '1' : '0');

        // Body text as primary text block
        formData.append('blocks[0][type]', 'text');
        formData.append('blocks[0][content_json][text]', bodyText);

        // Detached media IDs (will have journal_entry_id set to null without deleting Google Drive file)
        detachedMediaIds.forEach((id, i) => {
            formData.append(`detached_media_ids[${i}]`, String(id));
        });

        // Kept media IDs for explicit retention
        existingMedia.forEach((m, i) => {
            formData.append(`keep_media_ids[${i}]`, String(m.id));
        });

        // New images to upload and attach
        newImages.forEach((file, i) => {
            formData.append(`images[${i}]`, file);
        });

        router.post(`/journal/${entry.id}`, formData, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
            onError: (errs) => setErrors(errs),
        });
    };

    return (
        <>
            <Head title={`Edit ${entry.title} — Mementra`} />
            <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                {/* Top Nav */}
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                        <Link href={`/journal/${entry.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancel Edit</span>
                        </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground font-medium">Editing Memory #{entry.id}</span>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Edit Memory</h1>
                    <p className="text-sm text-muted-foreground">
                        Update your recorded story, attached photos, or emotional tone.
                    </p>
                </div>

                <Card className="border-border/80 bg-card shadow-xs">
                    <CardHeader className="pb-4 border-b border-border/50">
                        <CardTitle className="text-base font-bold">Memory Information</CardTitle>
                        <CardDescription className="text-xs">
                            Saved changes will update in your living timeline immediately.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Memory Title <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-11 text-base font-medium rounded-xl"
                                    required
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            {/* Date & Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entry_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                        <span>Date of Memory</span>
                                    </Label>
                                    <Input
                                        id="entry_date"
                                        type="date"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                        required
                                    />
                                    {errors.entry_date && <p className="text-xs text-destructive">{errors.entry_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                                        <span>Location (Optional)</span>
                                    </Label>
                                    <Input
                                        id="location_name"
                                        value={locationName}
                                        onChange={(e) => setLocationName(e.target.value)}
                                        className="h-10 text-xs rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Interactive Mood Selector */}
                            <div className="space-y-2.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Mood Tone
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {moodOptions.map((item) => {
                                        const isSelected = mood === item.value;
                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setMood(item.value)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                                    isSelected
                                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/30 font-semibold'
                                                        : 'border-border/70 bg-card hover:bg-muted/40 text-muted-foreground'
                                                }`}
                                            >
                                                <span className="text-base">{item.emoji}</span>
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Story Textarea */}
                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Your Story <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="content"
                                    rows={9}
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    placeholder="Write your story and memories here..."
                                    className="resize-y text-sm leading-relaxed rounded-xl p-4"
                                    required
                                />
                                {errors['blocks.0.content_json.text'] && (
                                    <p className="text-xs text-destructive">{errors['blocks.0.content_json.text']}</p>
                                )}
                            </div>

                            {/* Existing Attached Media Section */}
                            {initialExistingMedia.length > 0 && (
                                <div className="space-y-3 border-t border-border/50 pt-5">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                                            <span>Attached Photos ({existingMedia.length})</span>
                                        </Label>
                                        <span className="text-[11px] text-muted-foreground">
                                            Removing photos detaches them from this memory and keeps them safe in your Photo Gallery.
                                        </span>
                                    </div>

                                    {existingMedia.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {existingMedia.map((m) => (
                                                <div
                                                    key={m.id}
                                                    className="group relative h-28 w-28 rounded-2xl overflow-hidden border border-border bg-muted shadow-xs transition-all"
                                                >
                                                    {imageErrors[m.id] ? (
                                                        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/50 p-2 text-center text-muted-foreground">
                                                            <ImageOff className="h-5 w-5 mb-1 text-muted-foreground/60" />
                                                            <span className="text-[9px] truncate max-w-full">{m.original_filename}</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={resolveMediaSrc(m)}
                                                            alt={m.original_filename}
                                                            onError={() => handleImageError(m.id)}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingMedia(m.id)}
                                                        title="Detach photo from this memory"
                                                        className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/75 hover:bg-destructive text-white flex items-center justify-center transition-all shadow-md active:scale-90"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>

                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-white text-[9px] truncate text-center">
                                                        {m.original_filename}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            All previously attached photos have been marked for detachment.
                                        </p>
                                    )}

                                    {/* Detached Media Recovery List */}
                                    {detachedMediaIds.length > 0 && (
                                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2 mt-2">
                                            <div className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                                                <span>Detached photos ({detachedMediaIds.length}) &mdash; will be detached upon save:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {detachedMediaIds.map((id) => {
                                                    const original = initialExistingMedia.find((m) => m.id === id);
                                                    return (
                                                        <div
                                                            key={id}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                                                        >
                                                            <span className="truncate max-w-[140px] text-[11px]">
                                                                {original?.original_filename ?? `Photo #${id}`}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => undoRemoveExistingMedia(id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                                                                title="Restore photo to memory"
                                                            >
                                                                <RotateCcw className="h-3 w-3" />
                                                                <span>Restore</span>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Add More Photos */}
                            <div className="space-y-3 border-t border-border/50 pt-5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Add More Photos
                                </Label>
                                <div className="flex flex-wrap gap-3">
                                    {newImages.map((file, index) => (
                                        <div
                                            key={index}
                                            className="group relative h-28 w-28 rounded-2xl overflow-hidden border border-border bg-muted shadow-xs"
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                title="Remove this photo"
                                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/75 hover:bg-destructive text-white flex items-center justify-center transition-all shadow-md active:scale-90"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-white text-[9px] truncate text-center">
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                                    >
                                        <ImagePlus className="h-5 w-5" />
                                        <span className="text-[10px] font-medium">Add Photo</span>
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => addImages(e.target.files)}
                                />
                            </div>

                            {/* Private Checkbox */}
                            <div className="flex items-center space-x-3 rounded-xl border border-border/60 p-3.5 bg-muted/20">
                                <input
                                    type="checkbox"
                                    id="is_private"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <Label htmlFor="is_private" className="text-xs font-normal text-foreground cursor-pointer">
                                    <span className="font-semibold">Keep strictly private</span> &mdash; only visible to your account.
                                </Label>
                            </div>

                            {/* Submit Row */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/journal/${entry.id}`}>Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-indigo-500/25 px-6"
                                >
                                    {processing ? 'Updating...' : 'Update Memory'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

JournalEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memory Journal', href: '/journal' },
        { title: 'Edit Memory', href: '#' },
    ],
};
