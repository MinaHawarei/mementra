import { Head, router } from '@inertiajs/react';
import { BookOpen, Download, FileText, Loader2, Sparkles, Clock } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExportItem {
    id: number;
    title: string;
    date_from?: string;
    date_to?: string;
    locale: string;
    format: string;
    status: string;
    file_size_bytes?: number;
    download_url?: string;
    created_at: string;
}

interface ExportsIndexProps {
    exports: ExportItem[];
}

export default function ExportsIndex({ exports = [] }: ExportsIndexProps) {
    const [title, setTitle] = useState('Our Living Story — Memory Book');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [locale, setLocale] = useState('en');
    const [processing, setProcessing] = useState(false);

    const handleGenerate = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            '/exports',
            {
                title,
                date_from: dateFrom || null,
                date_to: dateTo || null,
                locale,
            },
            {
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <>
            <Head title="Memory Book Export — Mementra" />
            <div className="flex flex-col gap-8 p-4 sm:p-6 max-w-5xl mx-auto w-full">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Memory Book
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Compile your private memories, photos, and milestones into a beautiful printable keepsake.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-5">
                    {/* Export Generator Form */}
                    <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card shadow-xs p-6 space-y-5">
                        <div>
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Generate New Book
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                Choose a date range and language for your PDF keepsake.
                            </p>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-xs font-medium">Book Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-9 text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="date_from" className="text-xs font-medium">From Date <span className="text-muted-foreground">(optional)</span></Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="date_to" className="text-xs font-medium">To Date <span className="text-muted-foreground">(optional)</span></Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-9 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="locale" className="text-xs font-medium">Book Language</Label>
                                <select
                                    id="locale"
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={locale}
                                    onChange={(e) => setLocale(e.target.value)}
                                >
                                    <option value="en">English (LTR)</option>
                                    <option value="ar">العربية (RTL)</option>
                                </select>
                            </div>

                            <Button type="submit" disabled={processing} className="w-full h-10 gap-2 mt-2">
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Compiling Book...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" /> Generate Memory Book
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    {/* Export History */}
                    <div className="md:col-span-3 rounded-2xl border border-border/80 bg-card shadow-xs p-6 space-y-4">
                        <div>
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Generated Books
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                Downloads are stored securely and remain available for 7 days.
                            </p>
                        </div>

                        {exports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-center rounded-xl border border-dashed border-border/60 bg-muted/30">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-3">
                                    <FileText className="h-7 w-7 text-primary/60 stroke-1" />
                                </div>
                                <p className="text-sm font-medium text-foreground">No memory books yet</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-48">
                                    Generate your first book using the form on the left.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {exports.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background hover:bg-primary/5 transition-colors group"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm text-foreground truncate">{item.title}</span>
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                                                    {item.locale}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {item.date_from || 'Beginning'} → {item.date_to || 'Present'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 ms-4 shrink-0">
                                            {item.status === 'completed' && item.download_url && (
                                                <Button asChild size="sm" variant="outline" className="gap-1.5 h-8 text-xs border-primary/30 text-primary hover:bg-primary/10">
                                                    <a href={item.download_url} download>
                                                        <Download className="h-3.5 w-3.5" /> Download
                                                    </a>
                                                </Button>
                                            )}
                                            {(item.status === 'pending' || item.status === 'processing') && (
                                                <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Processing
                                                </span>
                                            )}
                                            {item.status === 'expired' && (
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                                                    Expired
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ExportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memory Book', href: '/exports' },
    ],
};
