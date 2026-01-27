
'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Utensils,
  MessageSquareWarning,
  LogOut,
  Loader2,
  CalendarCheck,
  Tag,
  Handshake,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import React from 'react';
import { ADMIN_UID } from '@/lib/auth';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/applications', label: 'Host Applications', icon: ClipboardList },
  { href: '/admin/experiences', label: 'Experiences', icon: Utensils },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/admin/reports', label: 'Reports', icon: MessageSquareWarning },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const isAdmin = user?.uid === ADMIN_UID;
  
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  React.useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push(`/login?redirect=${pathname}`);
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isUserLoading, isAdmin, router, pathname]);

  if (isUserLoading || !user || !isAdmin) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/profile" className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  {user.photoURL ? <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} /> : <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>}
                </Avatar>
                <div className="overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:hidden">
                  <p className="font-semibold text-sm">{user.displayName || 'User Profile'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
