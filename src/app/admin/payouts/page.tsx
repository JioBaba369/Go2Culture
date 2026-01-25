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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Booking, User } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { isPast } from 'date-fns';

type HostPayouts = {
  host: User;
  totalEarnings: number;
  upcomingEarnings: number;
  pendingEarnings: number;
  totalBookings: number;
  confirmedBookings: number;
};

export default function AdminPayoutsPage() {
  const firestore = useFirestore();

  const { data: users, isLoading: areUsersLoading } = useCollection<User>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore])
  );

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'bookings') : null), [firestore])
  );

  const isLoading = areUsersLoading || areBookingsLoading;

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

      <Card>
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
              {!isLoading && hostPayouts.map(({ host, totalEarnings, upcomingEarnings, pendingEarnings, confirmedBookings }) => (
                <TableRow key={host.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {host.profilePhotoURL && <AvatarImage src={host.profilePhotoURL} alt={host.fullName} />}
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
              ))}
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
