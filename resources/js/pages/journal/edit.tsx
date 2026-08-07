import { Head, router } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function JournalEdit({ entry }: JournalEditProps) {
    const firstTextBlock = entry.blocks?.find((b) => b.type === 'text');

    const [title, setTitle] = useState(entry.title);
    const [entryDate, setEntryDate] = useState(entry.entry_date);
    const [locationName, setLocationName] = useState(entry.location_name ?? '');
    const [mood, setMood] = useState(entry.mood ?? 'happy');
    const [isPrivate, setIsPrivate] = useState(entry.is_private);
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
            <Head title={`Edit ${entry.title}`} />
            <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Memory</h1>
                    <p className="text-sm text-muted-foreground">Update your memory entry details.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Edit Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="entry_date">Date of Memory</Label>
                                    <Input
                                        id="entry_date"
                                        type="date"
                                        value={entryDate}
                                        onChange={(e) => setEntryDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mood">Mood</Label>
                                    <select
                                        id="mood"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={mood}
                                        onChange={(e) => setMood(e.target.value)}
                                    >
                                        <option value="happy">Happy 😊</option>
                                        <option value="loved">Loved ❤️</option>
                                        <option value="grateful">Grateful 🙏</option>
                                        <option value="calm">Calm 🌿</option>
                                        <option value="nostalgic">Nostalgic 🌅</option>
                                        <option value="thoughtful">Thoughtful 💭</option>
                                        <option value="excited">Excited 🎉</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location_name">Location (Optional)</Label>
                                <Input
                                    id="location_name"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Journal Text</Label>
                                <Textarea
                                    id="content"
                                    rows={8}
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Existing Attached Photos */}
                            {entry.media && entry.media.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Existing Photos</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {entry.media.map((m) => (
                                            <div key={m.id} className="h-20 w-20 rounded-lg overflow-hidden border bg-muted">
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

                            {/* New Image Upload Section */}
                            <div className="space-y-2">
                                <Label>Add More Photos</Label>
                                <div className="flex flex-wrap gap-3">
                                    {newImages.map((file, index) => (
                                        <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden border bg-muted group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-rose-400 hover:text-rose-500 transition-colors"
                                    >
                                        <ImagePlus className="h-5 w-5" />
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

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_private"
                                    className="rounded border-gray-300"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <Label htmlFor="is_private" className="text-xs font-normal">
                                    Keep this memory strictly private
                                </Label>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Memory'}
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
        { title: 'Journal', href: '/journal' },
        { title: 'Edit Memory', href: '#' },
    ],
};
