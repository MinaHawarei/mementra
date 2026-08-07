import { Head, router } from '@inertiajs/react';
import { BookOpen, Download, FileText, Loader2, Sparkles } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            <Head title="Memory Book Export" />
            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Memory Book Export (PDF)</h1>
                    <p className="text-sm text-muted-foreground">
                        Compile your private memories, photos, and milestones into a printable living book.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Export Generator Form */}
                    <Card className="md:col-span-1 border-rose-200 dark:border-rose-900/50">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-600">
                                <BookOpen className="h-4 w-4" /> Generate New Book
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Choose date range and language for your printable PDF book.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs">Book Title</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-8 text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="date_from" className="text-xs">Date From (Optional)</Label>
                                    <Input
                                        id="date_from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="date_to" className="text-xs">Date To (Optional)</Label>
                                    <Input
                                        id="date_to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="locale" className="text-xs">Book Language</Label>
                                    <select
                                        id="locale"
                                        className="h-8 w-full rounded-md border border-input bg-transparent px-3 text-xs"
                                        value={locale}
                                        onChange={(e) => setLocale(e.target.value)}
                                    >
                                        <option value="en">English (LTR)</option>
                                        <option value="ar">العربية (RTL)</option>
                                    </select>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full bg-rose-600 hover:bg-rose-700 h-9 text-xs gap-2 mt-2">
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
                        </CardContent>
                    </Card>

                    {/* Export History List */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Generated Books History</CardTitle>
                            <CardDescription className="text-xs">
                                Downloads are stored securely and remain available for 7 days.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {exports.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                                    <FileText className="h-10 w-10 text-muted-foreground/50 mb-2 stroke-1" />
                                    <p className="text-sm font-medium text-muted-foreground">No memory books generated yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {exports.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/40 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm">{item.title}</span>
                                                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted">
                                                        {item.locale}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.date_from || 'Beginning'} → {item.date_to || 'Present'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.status === 'completed' && item.download_url && (
                                                    <Button asChild size="sm" variant="outline" className="gap-1 h-8 text-xs border-rose-200 text-rose-600 hover:bg-rose-50">
                                                        <a href={item.download_url} download>
                                                            <Download className="h-3.5 w-3.5" /> Download
                                                        </a>
                                                    </Button>
                                                )}
                                                {item.status === 'pending' || item.status === 'processing' ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded">
                                                        <Loader2 className="h-3 w-3 animate-spin" /> Processing
                                                    </span>
                                                ) : null}
                                                {item.status === 'expired' && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
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

ExportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Memory Book', href: '/exports' },
    ],
};
