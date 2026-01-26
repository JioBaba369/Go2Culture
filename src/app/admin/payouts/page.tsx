
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Booking, User } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isPast } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Banknote, DollarSign, TrendingUp } from 'lucide-react';
import { ADMIN_UID } from '@/lib/auth';

type HostPayouts = {
  host: User;
  totalEarnings: number;
  upcomingEarnings: number;
  pendingEarnings: number;
  totalBookings: number;
  confirmedBookings: number;
};

function PayoutsSummary({ payouts, bookings, isLoading }: { payouts: HostPayouts[], bookings: Booking[] | null, isLoading: boolean }) {
  const summary = useMemo(() => {
    if (!bookings || payouts.length === 0) return { totalPaid: 0, platformRevenue: 0, upcomingPayouts: 0 };

    const totalPaid = payouts.reduce((sum, p) => sum + p.totalEarnings, 0);
    const upcomingPayouts = payouts.reduce((sum, p) => sum + p.upcomingEarnings, 0);
    
    // Assume platform takes a 15% commission on the total price of confirmed bookings
    const totalBookingValue = bookings
      .filter(b => b.status === 'Confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const platformRevenue = totalBookingValue * 0.15;

    return { totalPaid, platformRevenue, upcomingPayouts };
  }, [payouts, bookings]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid to Hosts</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.totalPaid.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Platform Revenue</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.platformRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Based on a 15% commission.</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Payouts</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.upcomingPayouts.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}

function PayoutCardMobile({ payout }: { payout: HostPayouts }) {
    const { host, totalEarnings, upcomingEarnings, pendingEarnings, confirmedBookings } = payout;
    const hostImage = PlaceHolderImages.find(p => p.id === host.profilePhotoId);
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                 <Avatar className="h-10 w-10">
                    {hostImage && <AvatarImage src={hostImage.imageUrl} alt={host.fullName} />}
                    <AvatarFallback>{host.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <CardTitle className="text-base">{host.fullName}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Earnings:</span>
                    <span className="font-semibold">${totalEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Upcoming:</span>
                    <span className="font-semibold">${upcomingEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-semibold">${pendingEarnings.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmed Bookings:</span>
                    <span className="font-semibold">{confirmedBookings}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminPayoutsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(
    useMemoFirebase(() => (firestore && isAdmin ? collection(firestore, 'users') : null), [firestore, isAdmin])
  );

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(
    useMemoFirebase(() => (firestore && isAdmin ? collection(firestore, 'bookings') : null), [firestore, isAdmin])
  );

  const isLoading = isUserLoading || areUsersLoading || areBookingsLoading;

  const hostPayouts = useMemo<HostPayouts[]>(() => {
    if (!users || !bookings) return [];

    const hosts = users.filter(u => u.role === 'host' || u.role === 'both');
    const bookingsByHost = bookings.reduce((acc, booking) => {
      if (!acc[booking.hostId]) {
        acc[booking.hostId] = [];
      }
      acc[booking.hostId].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);

    return hosts.map(host => {
      const hostBookings = bookingsByHost[host.id] || [];
      
      const totalEarnings = hostBookings
        .filter(b => b.status === 'Confirmed' && isPast(b.bookingDate.toDate()))
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const upcomingEarnings = hostBookings
        .filter(b => b.status === 'Confirmed' && !isPast(b.bookingDate.toDate()))
        .reduce((sum, b) => sum + b.totalPrice, 0);
        
      const pendingEarnings = hostBookings
        .filter(b => b.status === 'Pending')
        .reduce((sum, b) => sum + b.totalPrice, 0);

      return {
        host,
        totalEarnings,
        upcomingEarnings,
        pendingEarnings,
        totalBookings: hostBookings.length,
        confirmedBookings: hostBookings.filter(b => b.status === 'Confirmed').length,
      };
    }).sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [users, bookings]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Host Payouts</h1>
        <p className="text-muted-foreground">
          Monitor earnings and payouts for all hosts on the platform.
        </p>
      </div>

      <PayoutsSummary payouts={hostPayouts} bookings={bookings} isLoading={isLoading} />
      
      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">All Hosts</h2>
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
        ))}
        {hostPayouts.map(payout => (
          <PayoutCardMobile key={payout.host.id} payout={payout} />
        ))}
         {!isLoading && hostPayouts.length === 0 && (
            <Card className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No host payout data.</p>
            </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Payouts Summary</CardTitle>
          <CardDescription>
            Financial overview for each host.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Upcoming Earnings</TableHead>
                <TableHead>Pending Earnings</TableHead>
                <TableHead>Confirmed Bookings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && hostPayouts.map(({ host, totalEarnings, upcomingEarnings, pendingEarnings, confirmedBookings }) => {
                const hostImage = PlaceHolderImages.find(p => p.id === host.profilePhotoId);
                return (
                <TableRow key={host.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {hostImage && <AvatarImage src={hostImage.imageUrl} alt={host.fullName} />}
                        <AvatarFallback>{host.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{host.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>${totalEarnings.toFixed(2)}</TableCell>
                  <TableCell>${upcomingEarnings.toFixed(2)}</TableCell>
                  <TableCell>${pendingEarnings.toFixed(2)}</TableCell>
                  <TableCell>{confirmedBookings}</TableCell>
                </TableRow>
              )})}
               {!isLoading && hostPayouts.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                     No host data to display.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
