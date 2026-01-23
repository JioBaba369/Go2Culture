
'use client';

import React, { useState, useMemo } from 'react';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Booking, Host, User } from '@/lib/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isSameDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function GuestListItem({ booking }: { booking: Booking }) {
    const { firestore } = useFirebase();
    const guestRef = useMemoFirebase(() => (firestore ? doc(firestore, 'users', booking.guestId) : null), [firestore, booking.guestId]);
    const { data: guest, isLoading } = useDoc<User>(guestRef);

    if (isLoading || !guest) {
        return <div className="flex items-center justify-between p-3"><Skeleton className="h-10 w-full" /></div>;
    }
    
    const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);

    return (
        <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    {guestImage && <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} />}
                    <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{guest.fullName}</p>
                    <p className="text-sm text-muted-foreground">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                </div>
            </div>
            <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
            </Button>
        </div>
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
    if (!selectedDate || !bookings) return {};
    const dayBookings = bookings.filter(booking => isSameDay(booking.bookingDate.toDate(), selectedDate));
    return dayBookings.reduce((acc, booking) => {
      const title = booking.experienceTitle;
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);
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
                    <CardTitle>Bookings for Date</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-0">
                    {selectedDate && Object.keys(bookingsForSelectedDay).length > 0 ? (
                        Object.entries(bookingsForSelectedDay).map(([title, bookingsList]) => (
                            <div key={title} className="py-2">
                                <h4 className="font-semibold text-sm px-4 pb-2 border-b">{title}</h4>
                                <div className="pt-2">
                                    {bookingsList.map(booking => (
                                        <GuestListItem key={booking.id} booking={booking} />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8 px-4">
                            {selectedDate ? "No bookings for this date." : "Select a date to see bookings."}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

export { BookingCalendar };
