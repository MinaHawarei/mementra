import { Link } from '@inertiajs/react';
import { Bell, BookOpen, Calendar, Clock, Heart, Images, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Journal',
        href: '/journal',
        icon: BookOpen,
    },
    {
        title: 'Memories',
        href: '/memories',
        icon: Images,
    },
    {
        title: 'Timeline',
        href: '/timeline',
        icon: Clock,
    },
    {
        title: 'Events',
        href: '/events',
        icon: Calendar,
    },
    {
        title: 'Reminders',
        href: '/reminders',
        icon: Bell,
    },
    {
        title: 'Our Story',
        href: '/relationship',
        icon: Heart,
    },
    {
        title: 'Memory Book',
        href: '/exports',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
