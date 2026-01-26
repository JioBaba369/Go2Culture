'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Loader2, User, CalendarCheck, Heart, Wallet } from 'lucide-react';
import React from 'react';

const profileNavItems = [
  { href: '/profile', label: 'Profile Settings', icon: User },
  { href: '/profile/bookings', label: 'My Bookings', icon: CalendarCheck },
  { href: '/profile/wishlist', label: 'My Wishlist', icon: Heart },
  { href: '/profile/referrals', label: 'Referrals & Credits', icon: Wallet },
];

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12 grid md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        <nav className="flex flex-col gap-2">
          {profileNavItems.map(item => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? 'default' : 'ghost'}
              className="justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>
      <main className="md:col-span-3">
        {children}
      </main>
    </div>
  );
}
