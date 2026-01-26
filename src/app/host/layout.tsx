'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { Loader2, Utensils, Calendar, CalendarCheck, LayoutDashboard, LogOut, Home, FileText } from 'lucide-react';
import React from 'react';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { User } from '@/lib/types';
import { Logo } from '@/components/logo';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
    { href: '/host', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/host/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/host/calendar', label: 'Calendar', icon: Calendar },
    { href: '/host/experiences', label: 'Experiences', icon: Utensils },
    { href: '/host/contract', label: 'Host Contract', icon: FileText },
];

export default function HostLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading, auth, firestore } = useFirebase();
    
    const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/login');
        }
    };

    React.useEffect(() => {
        if (!isUserLoading) {
            if (!user) {
                router.push('/login?redirect=/host');
            } else if (userProfile && userProfile.role === 'guest') {
                router.push('/become-a-host');
            }
        }
    }, [user, isUserLoading, userProfile, router]);

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading || !user || !userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const userImage = PlaceHolderImages.find(p => p.id === userProfile?.profilePhotoId);

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
                        {navItems.map((item) => (
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
                            <Link href="/">
                                <SidebarMenuButton tooltip="Exit to Site">
                                    <Home />
                                    <span>Exit to Site</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                                <LogOut />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Link href="/profile" className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent">
                                <Avatar className="h-8 w-8">
                                    {userImage ? <AvatarImage src={userImage.imageUrl} alt={userProfile.fullName} /> : null}
                                    <AvatarFallback>{userProfile.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden whitespace-nowrap group-data-[collapsible=icon]:hidden">
                                    <p className="font-semibold text-sm">{userProfile.fullName}</p>
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
