import { Link } from '@inertiajs/react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid min-h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0 bg-background">
            {/* Left Decorative Panel */}
            <div className="relative hidden h-full flex-col justify-between p-12 text-white lg:flex overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 border-r border-border/40">
                {/* Ambient glow orbs */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

                {/* Top Brand Link */}
                <div className="relative z-20">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2.5 group"
                    >
                        <AppLogoIcon className="size-9 group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white">
                                Mementra
                            </span>
                            <span className="text-[10px] font-medium tracking-widest uppercase text-indigo-300 -mt-1">
                                Living Memory
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Middle Emotional Showcase */}
                <div className="relative z-20 max-w-md my-auto space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-200 backdrop-blur-sm">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span>A quiet sanctuary for shared stories</span>
                    </div>

                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                        Every day holds a story worth keeping.
                    </h2>

                    <p className="text-sm text-indigo-200/80 leading-relaxed">
                        Capture heartfelt memories, celebrate cherished milestones, and revisit the moments that shaped your bond.
                    </p>

                    <div className="pt-4 flex items-center gap-6 text-xs text-indigo-300/70 border-t border-indigo-500/20">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            <span>Private & Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Heart className="h-4 w-4 text-purple-400" />
                            <span>For You & Partners</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Quote */}
                <div className="relative z-20 text-xs text-indigo-300/60">
                    &copy; {new Date().getFullYear()} Mementra. All rights reserved.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="w-full p-6 sm:p-10 lg:p-14 flex items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center gap-2 lg:hidden mb-2"
                    >
                        <AppLogoIcon className="size-10" />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                            Mementra
                        </span>
                    </Link>

                    {title && (
                        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                            {description && (
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
