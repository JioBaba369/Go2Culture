
'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUser, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { doc } from 'firebase/firestore';
import { User } from '@/lib/types';
import { Logo } from '@/components/logo';

const navItems = [
    { href: '/host', label: 'Dashboard' },
    { href: '/host/bookings', label: 'Bookings' },
    { href: '/host/calendar', label: 'Calendar' },
    { href: '/host/experiences', label: 'Experiences' },
]

export default function HostLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading, firestore } = useFirebase();
    
    const userDocRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

     React.useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?redirect=/host');
        }
        if (!isProfileLoading && userProfile && userProfile.role === 'guest') {
            router.push('/become-a-host');
        }
    }, [user, isUserLoading, userProfile, isProfileLoading, router]);

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading || !user || !userProfile) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container flex h-16 items-center justify-between">
                    <Logo />
                     <nav className="flex items-center gap-2">
                        {navItems.map(item => (
                            <Button key={item.href} asChild variant={pathname === item.href ? 'default' : 'ghost'}>
                                <Link href={item.href}>{item.label}</Link>
                            </Button>
                        ))}
                         <Button asChild variant="outline">
                            <Link href="/">Exit to Site</Link>
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="container py-8">
                {children}
            </main>
        </>
    );
}
