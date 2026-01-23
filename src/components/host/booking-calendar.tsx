
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Booking, Host, User } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function BookingListItem({ booking }: { booking: Booking }) {
    const { firestore } = useFirebase();
    const guestRef = useMemoFirebase(() => (firestore ? doc(firestore, 'users', booking.guestId) : null), [firestore, booking.guestId]);
    const { data: guest, isLoading } = useDoc<User>(guestRef);

    if (isLoading) {
        return <Skeleton className="h-20 w-full rounded-lg" />;
    }

    return (
        <li className="text-sm p-3 bg-secondary rounded-lg space-y-1">
            <p className="font-medium text-secondary-foreground truncate">Experience: {booking.experienceId}</p>
            <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> {guest?.fullName || 'Guest'}</span>
                <span>{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
            </div>
        </li>
    );
}


function BookingCalendar() {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Fetch Host profile to get blocked dates
  const hostRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid, 'hosts', user.uid) : null),
    [firestore, user]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  // 2. Fetch all bookings for this host
  const bookingsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'bookings'), where('hostId', '==', user.uid)) : null),
    [firestore, user]
  );
  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  
  // 3. Memoize processed data
  const blockedDates = useMemo(() => host?.blockedDates?.map(d => parseISO(d)) || [], [host]);
  const bookingDates = useMemo(() => bookings?.map(b => b.bookingDate.toDate()) || [], [bookings]);

  const bookingsForSelectedDay = useMemo(() => {
    if (!selectedDate || !bookings) return [];
    return bookings.filter(booking => isSameDay(booking.bookingDate.toDate(), selectedDate));
  }, [selectedDate, bookings]);

  // Calendar modifiers for styling
  const modifiers = {
    blocked: blockedDates,
    booked: bookingDates,
  };
  const modifiersClassNames = {
    blocked: 'line-through text-muted-foreground !opacity-50',
    booked: 'font-bold text-primary',
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !host || !user) return;
    setIsUpdating(true);
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const isBlocked = host.blockedDates?.includes(dateString);
    
    try {
      const hostDocRef = doc(firestore, 'users', user.uid, 'hosts', user.uid);
      await updateDoc(hostDocRef, {
        blockedDates: isBlocked ? arrayRemove(dateString) : arrayUnion(dateString)
      });
      toast({
        title: isBlocked ? "Date Unblocked" : "Date Blocked",
        description: `Guests can ${isBlocked ? 'now' : 'no longer'} book ${format(selectedDate, 'PPP')}.`,
      });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your availability.' });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const isLoading = isUserLoading || isHostLoading || areBookingsLoading;
  
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Skeleton className="h-[400px] w-full" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
  
  if (!isHostLoading && !host) {
    return (
        <Card className="text-center p-8 flex flex-col items-center justify-center">
            <CardTitle>You're not a host yet!</CardTitle>
            <CardDescription className="mt-2">To manage your calendar, you first need to become a host.</CardDescription>
            <Button asChild className="mt-4"><Link href="/become-a-host">Become a Host</Link></Button>
        </Card>
    )
  }

  const isSelectedDateBlocked = selectedDate && blockedDates.some(d => isSameDay(d, selectedDate));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Your Booking Calendar</CardTitle>
                <CardDescription>View your schedule and manage availability.</CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifiersClassNames={modifiersClassNames}
                    className="p-0"
                    disabled={{ before: new Date() }}
                />
                 <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" /> Booked Day</div>
                    <div className="flex items-center gap-2"><span className="h-px w-4 bg-muted-foreground" /> Blocked Day</div>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleBlockDate} disabled={!selectedDate || isUpdating} className="w-full">
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSelectedDateBlocked ? 'Unblock Date' : 'Block Date'}
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {bookingsForSelectedDay.length > 0 ? (
                        <ul className="space-y-3">
                            {bookingsForSelectedDay.map(booking => (
                                <BookingListItem key={booking.id} booking={booking}/>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No bookings for this date.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

export { BookingCalendar };
