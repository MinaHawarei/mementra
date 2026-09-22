import { Head, Link, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { ImagePlus, X, ArrowLeft, Lock, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ExistingMedia {
    id: number;
    original_filename: string;
}

interface JournalEditProps {
    entry: {
        id: number;
        title: string;
        entry_date: string;
        location_name?: string;
        mood?: string;
        is_private: boolean;
        blocks?: Array<{ id: number; type: string; content?: { text?: string } }>;
        media?: ExistingMedia[];
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
    // Safe blocks extraction
    const blocksList = Array.isArray(entry?.blocks) ? entry.blocks : [];
    const firstTextBlock = blocksList.find((b) => b.type === 'text');

    const [title, setTitle] = useState(entry?.title ?? '');
    const [entryDate, setEntryDate] = useState(entry?.entry_date ?? '');
    const [locationName, setLocationName] = useState(entry?.location_name ?? '');
    const [mood, setMood] = useState(entry?.mood ? entry.mood.toLowerCase() : 'happy');
    const [isPrivate, setIsPrivate] = useState(Boolean(entry?.is_private));
    const [bodyText, setBodyText] = useState(firstTextBlock?.content?.text ?? '');
    const [newImages, setNewImages] = useState<File[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addImages = (files: FileList | null) => {
        if (!files) return;
        setNewImages((prev) => [...prev, ...Array.from(files)]);
    };

    const removeNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
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
        formData.append('blocks[0][type]', 'text');
        formData.append('blocks[0][content_json][text]', bodyText);

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
                        <CardDescription className="text-xs">Saved changes will update in your living timeline immediately.</CardDescription>
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
                                    className="resize-y text-sm leading-relaxed rounded-xl p-4"
                                    required
                                />
                                {errors['blocks.0.content_json.text'] && (
                                    <p className="text-xs text-destructive">{errors['blocks.0.content_json.text']}</p>
                                )}
                            </div>

                            {/* Existing Media Section */}
                            {entry.media && entry.media.length > 0 && (
                                <div className="space-y-3 border-t border-border/50 pt-5">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                                        <span>Existing Photos ({entry.media.length})</span>
                                    </Label>
                                    <div className="flex flex-wrap gap-3">
                                        {entry.media.map((m) => (
                                            <div
                                                key={m.id}
                                                className="relative h-24 w-24 rounded-2xl overflow-hidden border border-border bg-muted shadow-xs"
                                            >
                                                <img
                                                    src={`/media/${m.id}/file`}
                                                    alt={m.original_filename}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add More Photos */}
                            <div className="space-y-3 border-t border-border/50 pt-5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Add More Photos
                                </Label>
                                <div className="flex flex-wrap gap-3">
                                    {newImages.map((file, index) => (
                                        <div key={index} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-border bg-muted group shadow-xs">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
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
