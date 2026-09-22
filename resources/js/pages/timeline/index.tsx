import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Heart, Images, Sparkles, MapPin } from 'lucide-react';
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
            <Head title="Living Timeline — Mementra" />
            <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {isRtl ? 'الجدول الزمني الحي' : 'Living Timeline'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isRtl
                            ? 'تاريخ زمني لمعالمكم الشخصية والمشتركة عبر الأيام.'
                            : 'A chronological tapestry of your shared and personal milestones across time.'}
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-border bg-card/60">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                            <Clock className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-lg font-bold text-foreground">
                            {isRtl ? 'قصتك تبدأ الآن' : 'Your timeline is just beginning'}
                        </CardTitle>
                        <CardDescription className="max-w-xs mt-1 text-xs text-muted-foreground">
                            {isRtl
                                ? 'اكتب مذكرات أو أضف مناسبات لترى شريط ذكرياتك يزدهر.'
                                : 'Record journal entries or add events to see your living timeline unfold.'}
                        </CardDescription>
                    </div>
                ) : (
                    <div className={`relative ${isRtl ? 'border-r-2 mr-4 pr-6' : 'border-l-2 ml-4 pl-0'} border-indigo-500/25 space-y-8 py-2`}>
                        {items.map((evt) => (
                            <div key={evt.id} className={`relative ${isRtl ? '' : 'pl-7'}`}>
                                {/* Timeline Node Marker */}
                                <div className={`absolute ${isRtl ? '-right-[17px]' : '-left-[17px]'} top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white ring-4 ring-background shadow-xs`}>
                                    {evt.event_type.includes('journal') ? (
                                        <BookOpen className="h-3.5 w-3.5" />
                                    ) : evt.event_type.includes('relationship') ? (
                                        <Heart className="h-3.5 w-3.5 fill-current" />
                                    ) : (
                                        <Calendar className="h-3.5 w-3.5" />
                                    )}
                                </div>

                                <Card className="border-border/80 bg-card shadow-xs transition-all duration-200 hover:shadow-md hover:border-indigo-500/30">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                                                {evt.event_date}
                                            </span>
                                            <span className="capitalize text-[10px] font-medium rounded-full bg-muted/70 px-2 py-0.5 border border-border/40">
                                                {evt.event_type.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base font-bold text-foreground">
                                            {evt.eventable_id && evt.event_type.includes('journal') ? (
                                                <Link href={`/journal/${evt.eventable_id}`} className="hover:text-primary transition-colors">
                                                    {evt.title}
                                                </Link>
                                            ) : (
                                                evt.title
                                            )}
                                        </CardTitle>
                                    </CardHeader>

                                    {evt.description && (
                                        <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                                            {evt.description}
                                        </CardContent>
                                    )}

                                    {evt.media && evt.media.length > 0 && (
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex gap-2 overflow-x-auto pt-1">
                                                {evt.media.slice(0, 4).map((m) => (
                                                    <div key={m.id} className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-border bg-muted shadow-xs">
                                                        <img
                                                            src={`/media/${m.id}/file`}
                                                            alt={m.original_filename}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {evt.media.length > 4 && (
                                                    <div className="h-16 w-16 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                                                        <span className="text-xs text-muted-foreground font-semibold">
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
        { title: 'Living Timeline', href: '/timeline' },
    ],
};
