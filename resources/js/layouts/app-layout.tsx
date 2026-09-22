import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    // Read breadcrumbs from props, or fallback to child component's static layout definition
    const resolvedBreadcrumbs: BreadcrumbItem[] =
        breadcrumbs && breadcrumbs.length > 0
            ? breadcrumbs
            : (children as any)?.type?.layout?.breadcrumbs || [];

    return (
        <AppLayoutTemplate breadcrumbs={resolvedBreadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
