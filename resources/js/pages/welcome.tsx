import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Heart, Sparkles, ArrowRight, ShieldCheck, Download, Smile } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props as { auth?: { user?: { name: string } } };
    const user = auth?.user;

    return (
        <>
            <Head title="Mementra — Preserve the moments that matter" />

            <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
                {/* Ambient Background Glows */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-amber-500/10 blur-3xl" />
                    <div className="absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="absolute top-2/3 -right-48 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
                </div>

                {/* Header / Nav */}
                <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <AppLogoIcon className="h-10 w-10 group-hover:scale-105 transition-transform duration-200" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent">
                                Mementra
                            </span>
                            <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground -mt-1">
                                Living Memory
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-3">
                        {user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all duration-200"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-indigo-500/25 hover:opacity-90 hover:shadow-indigo-500/35 transition-all duration-200"
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 text-center lg:px-8 lg:pt-24 lg:pb-32">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md shadow-xs mb-8">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>A tranquil sanctuary for your most cherished stories</span>
                    </div>

                    <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
                        Preserve the moments{' '}
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-indigo-400 dark:via-purple-300 dark:to-amber-300 bg-clip-text text-transparent">
                            that matter most
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg sm:leading-relaxed">
                        Mementra is your private space to capture heartfelt journal memories, celebrate relationship milestones, and effortlessly revisit your journey across time.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={user ? dashboard() : register()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <span>{user ? 'Enter Your Space' : 'Begin Your Memory Journey'}</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        {!user && (
                            <Link
                                href={login()}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card/80 px-7 py-3.5 text-base font-medium text-foreground backdrop-blur-sm hover:bg-accent/40 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-indigo-500" />
                            <span>Private by Default</span>
                        </div>
                        <div className="h-3 w-px bg-border hidden sm:block" />
                        <div className="flex items-center gap-1.5">
                            <Heart className="h-4 w-4 text-purple-500" />
                            <span>Shared or Solo Spaces</span>
                        </div>
                        <div className="h-3 w-px bg-border hidden sm:block" />
                        <div className="flex items-center gap-1.5">
                            <Download className="h-4 w-4 text-amber-500" />
                            <span>Keepsake PDF Exports</span>
                        </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="mt-24 grid gap-8 text-left md:grid-cols-3">
                        {/* Card 1 */}
                        <div className="relative rounded-2xl border border-border bg-card/80 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-indigo-500/30 group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <h2 className="mt-5 text-lg font-bold tracking-tight">Expressive Journaling</h2>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                Write stories of every day, tag moods, record locations, and attach photo memories in a serene, distraction-free environment.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="relative rounded-2xl border border-border bg-card/80 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-purple-500/30 group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h2 className="mt-5 text-lg font-bold tracking-tight">Living Timeline</h2>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                Watch your shared experiences weave into a chronological tapestry. Revisit anniversaries and significant milestones effortlessly.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="relative rounded-2xl border border-border bg-card/80 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:border-amber-500/30 group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <h2 className="mt-5 text-lg font-bold tracking-tight">Events & Gentle Reminders</h2>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                Never let a meaningful moment slip by. Set recurring memory reminders and celebrate the dates that matter most to your heart.
                            </p>
                        </div>
                    </div>

                    {/* Emotional Quotation Banner */}
                    <div className="mt-20 rounded-3xl border border-border bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-amber-500/5 p-8 sm:p-12 text-center backdrop-blur-sm">
                        <Smile className="mx-auto h-8 w-8 text-indigo-500/80 mb-4" />
                        <blockquote className="text-xl sm:text-2xl font-semibold tracking-tight max-w-2xl mx-auto italic text-foreground/90">
                            &ldquo;Memories are the architecture of our love and lives. Mementra keeps their light alive forever.&rdquo;
                        </blockquote>
                        <p className="mt-4 text-xs tracking-wider uppercase text-muted-foreground">
                            Cherishing life&apos;s deepest connections
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative z-10 border-t border-border py-8 text-center text-xs text-muted-foreground">
                    <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <AppLogoIcon className="h-5 w-5" />
                            <span className="font-semibold text-foreground">Mementra</span>
                            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                        </div>
                        <div className="flex gap-6">
                            <Link href={login()} className="hover:text-foreground transition-colors">Sign In</Link>
                            <Link href={register()} className="hover:text-foreground transition-colors">Create Account</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
