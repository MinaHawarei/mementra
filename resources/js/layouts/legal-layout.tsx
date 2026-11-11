import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, home, login, register } from '@/routes';

interface LegalLayoutProps extends PropsWithChildren {
    title: string;
    description: string;
    lastUpdated?: string;
    badge?: string;
    toc?: Array<{ id: string; title: string }>;
    activeTab?: 'privacy' | 'terms';
}

export default function LegalLayout({
    children,
    title,
    description,
    lastUpdated = 'November 10, 2026',
    badge = 'Official Legal Notice',
    toc = [],
    activeTab,
}: LegalLayoutProps) {
    const { auth } = usePage().props as { auth?: { user?: { name: string } } };
    const user = auth?.user;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
            {/* Ambient Background Gradient Glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[750px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-amber-500/5 blur-3xl" />
                <div className="absolute top-1/2 -left-48 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-6">
                        <Link href={home()} className="flex items-center gap-2.5 group">
                            <AppLogoIcon className="h-9 w-9 group-hover:scale-105 transition-transform duration-200" />
                            <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent leading-none">
                                    Mementra
                                </span>
                                <span className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mt-0.5">
                                    Living Memory
                                </span>
                            </div>
                        </Link>

                        {/* Legal Sub-Nav */}
                        <nav className="hidden md:flex items-center gap-1 border-l border-border/60 pl-6 text-sm">
                            <Link
                                href="/privacy-policy"
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    activeTab === 'privacy'
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                }`}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    activeTab === 'terms'
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                }`}
                            >
                                Terms of Service
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                            >
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="rounded-xl px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition-opacity"
                                >
                                    <span>Get Started</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Page Header */}
            <section className="border-b border-border/40 bg-card/30 py-10 sm:py-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl space-y-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                {badge}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Effective Date: {lastUpdated}
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
                            {title}
                        </h1>

                        <p className="text-base text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Area with Table of Contents */}
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Table of Contents (Sticky on desktop) */}
                    {toc.length > 0 && (
                        <aside className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
                            <div className="sticky top-24 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-xs backdrop-blur-sm space-y-3">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                                    Table of Contents
                                </h2>
                                <nav className="space-y-1 text-xs">
                                    {toc.map((item, index) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className="block py-1.5 px-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors line-clamp-1"
                                        >
                                            <span className="text-muted-foreground/60 mr-1.5 font-mono">
                                                {index + 1}.
                                            </span>
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </aside>
                    )}

                    {/* Main Legal Content */}
                    <article className={`${toc.length > 0 ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} order-1 lg:order-2 space-y-10 leading-relaxed text-sm sm:text-base`}>
                        {children}
                    </article>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-border/60 bg-card/40 py-10 text-xs text-muted-foreground">
                <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <AppLogoIcon className="h-5 w-5" />
                        <span className="font-semibold text-foreground">Mementra</span>
                        <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <Link href={home()} className="hover:text-foreground transition-colors">
                            Home
                        </Link>
                        <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                        <Link href={login()} className="hover:text-foreground transition-colors">
                            Sign In
                        </Link>
                        <Link href={register()} className="hover:text-foreground transition-colors">
                            Create Account
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

