import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <AppLogoIcon className="size-8 shrink-0" />
            <div className="grid flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="truncate leading-tight font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent">
                    Mementra
                </span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground leading-none">
                    Living Memory
                </span>
            </div>
        </div>
    );
}
