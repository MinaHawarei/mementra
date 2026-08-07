import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Heart, Images, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MediaItem {
    id: number;
    original_filename: string;
    mime_type: string;
}

interface TimelineEvent {
    id: number;
    event_type: string;
    event_date: string;
    title: string;
    description?: string;
    eventable_type?: string;
    eventable_id?: number;
    media?: MediaItem[];
}

interface TimelineIndexProps {
    events: {
        data: TimelineEvent[];
        links?: Record<string, string | null>;
        meta?: {
            current_page: number;
            last_page: number;
        };
    };
}

export default function TimelineIndex({ events }: TimelineIndexProps) {
    const items = events?.data ?? [];
    const { props } = usePage();
    const locale = (props as { auth?: { user?: { locale?: string } } })?.auth?.user?.locale;
    const isRtl = locale === 'ar';

    return (
        <>
            <Head title="Story Timeline" />
            <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isRtl ? 'الجدول الزمني' : 'Relationship & Personal Timeline'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isRtl
                            ? 'تاريخ زمني لمعالمكم الشخصية والمشتركة.'
                            : 'A chronological history of your shared and personal milestones.'}
                    </p>
                </div>

                {items.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4 stroke-1" />
                        <CardTitle className="text-lg font-semibold">
                            {isRtl ? 'قصتك تبدأ الآن' : 'Your timeline is just beginning'}
                        </CardTitle>
                        <CardDescription className="max-w-xs mt-1">
                            {isRtl
                                ? 'اكتب مذكرات أو أضف أحداثاً لترى قصتك تنمو.'
                                : 'Write journal entries or add events to see your timeline grow over time.'}
                        </CardDescription>
                    </Card>
                ) : (
                    <div className={`relative ${isRtl ? 'border-r mr-4 pr-6' : 'border-l ml-4 pl-0'} border-rose-200 dark:border-rose-900/50 space-y-6`}>
                        {items.map((evt) => (
                            <div key={evt.id} className={`relative ${isRtl ? '' : 'pl-6'}`}>
                                <div className={`absolute ${isRtl ? '-right-2.5' : '-left-2.5'} top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white ring-4 ring-background`}>
                                    {evt.event_type.includes('journal') ? (
                                        <BookOpen className="h-3 w-3" />
                                    ) : evt.event_type.includes('relationship') ? (
                                        <Heart className="h-3 w-3" />
                                    ) : (
                                        <Calendar className="h-3 w-3" />
                                    )}
                                </div>
                                <Card>
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{evt.event_date}</span>
                                            <span className="capitalize text-[10px] rounded bg-muted px-1.5 py-0.5">
                                                {evt.event_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base font-semibold">
                                            {evt.eventable_id && evt.event_type.includes('journal') ? (
                                                <Link href={`/journal/${evt.eventable_id}`} className="hover:underline">
                                                    {evt.title}
                                                </Link>
                                            ) : (
                                                evt.title
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    {evt.description && (
                                        <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                            {evt.description}
                                        </CardContent>
                                    )}
                                    {evt.media && evt.media.length > 0 && (
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex gap-2 overflow-x-auto">
                                                {evt.media.slice(0, 4).map((m) => (
                                                    <div key={m.id} className="h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                                                        <img
                                                            src={`/media/${m.id}/file`}
                                                            alt={m.original_filename}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {evt.media.length > 4 && (
                                                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs text-muted-foreground font-medium">
                                                            +{evt.media.length - 4}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

TimelineIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Timeline', href: '/timeline' },
    ],
};
