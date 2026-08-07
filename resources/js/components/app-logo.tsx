import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
                <AppLogoIcon className="size-5" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-rose-600 dark:text-rose-400">
                    Mementra
                </span>
                <span className="text-[10px] text-muted-foreground leading-none">
                    Living Memory
                </span>
            </div>
        </>
    );
}
