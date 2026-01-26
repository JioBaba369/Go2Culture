'use client';
import React, { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Booking, User } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { format, isFuture, isPast } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';
import { cancelBookingByHost, confirmBooking } from '@/lib/host-actions';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, MessageSquare, MoreHorizontal, X } from 'lucide-react';
import Link from 'next/link';

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  Confirmed: 'default',
  Pending: 'secondary',
  Cancelled: 'destructive',
};

// This component fetches guest info for each booking row
function HostBookingRow({ booking, onAction }: { booking: Booking, onAction: () => void }) {
  const firestore = useFirestore();
  const guestRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', booking.guestId) : null),
    [firestore, booking.guestId]
  );
  const { data: guest, isLoading } = useDoc<User>(guestRef);
  const [isProcessing, setProcessing] = useState<null | 'confirm' | 'cancel'>(null);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setProcessing('confirm');
    try {
        await confirmBooking(firestore, booking.id);
        toast({ title: "Booking Confirmed!", description: "The guest has been notified." });
        onAction();
    } catch (e) {
        toast({ title: "Error", description: "Could not confirm booking.", variant: "destructive" });
    }
    setProcessing(null);
  };

  const handleCancel = async () => {
    setProcessing('cancel');
    try {
        await cancelBookingByHost(firestore, booking.id);
        toast({ title: "Booking Cancelled", variant: "destructive" });
        onAction();
    } catch(e) {
        toast({ title: "Error", description: "Could not cancel booking.", variant: "destructive" });
    }
    setProcessing(null);
  }

  if (isLoading || !guest) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-10 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);

  return (
     <TableRow>
      <TableCell className="font-medium">{booking.experienceTitle}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8">
            {guestImage && (
              <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} data-ai-hint={guestImage.imageHint}/>
            )}
            <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{guest.fullName}</span>
        </div>
      </TableCell>
      <TableCell>{booking.bookingDate?.toDate ? format(booking.bookingDate.toDate(), 'PP') : 'N/A'}</TableCell>
      <TableCell className="text-center">{booking.numberOfGuests}</TableCell>
      <TableCell>${booking.totalPrice}</TableCell>
      <TableCell>
        <Badge variant={statusVariantMap[booking.status]} className="capitalize">
          {booking.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
        {booking.status === 'Pending' && isFuture(booking.bookingDate.toDate()) ? (
            <>
                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleConfirm} disabled={!!isProcessing} aria-label="Confirm">
                    {isProcessing === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-red-50" onClick={handleCancel} disabled={!!isProcessing} aria-label="Cancel">
                    {isProcessing === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4" />}
                </Button>
            </>
        ) : null }
          <Button asChild variant="ghost" size="icon" aria-label="Chat with guest">
            <Link href={`/messages?id=${booking.id}`}>
              <MessageSquare className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// This component fetches guest info for each mobile booking card
function HostBookingCardMobile({ booking, onAction }: { booking: Booking, onAction: () => void }) {
  const firestore = useFirestore();
  const guestRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', booking.guestId) : null),
    [firestore, booking.guestId]
  );
  const { data: guest, isLoading } = useDoc<User>(guestRef);
  const { toast } = useToast();
  const [isProcessing, setProcessing] = useState<null | 'confirm' | 'cancel'>(null);

  const handleConfirm = async () => {
    setProcessing('confirm');
    try {
        await confirmBooking(firestore, booking.id);
        toast({ title: "Booking Confirmed!", description: "The guest has been notified." });
        onAction();
    } catch (e) {
        toast({ title: "Error", description: "Could not confirm booking.", variant: "destructive" });
    }
    setProcessing(null);
  };

  const handleCancel = async () => {
    setProcessing('cancel');
    try {
        await cancelBookingByHost(firestore, booking.id);
        toast({ title: "Booking Cancelled", variant: "destructive" });
        onAction();
    } catch(e) {
        toast({ title: "Error", description: "Could not cancel booking.", variant: "destructive" });
    }
    setProcessing(null);
  }

  if (isLoading || !guest) {
    return <Skeleton className="h-48 w-full" />;
  }

  const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);

  return (
    <Card key={booking.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-semibold">{booking.experienceTitle}</p>
            <div className="flex items-center gap-2 pt-1">
              <Avatar className="h-6 w-6">
                {guestImage && <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} data-ai-hint={guestImage.imageHint} />}
                <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Guest: {guest.fullName}</span>
            </div>
          </div>
          <Badge variant={statusVariantMap[booking.status]} className="capitalize">
            {booking.status}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{booking.bookingDate?.toDate ? format(booking.bookingDate.toDate(), 'PP') : 'N/A'}</span>
          <span className="font-bold text-foreground">${booking.totalPrice}</span>
        </div>
      </CardContent>
      {booking.status === 'Pending' && isFuture(booking.bookingDate.toDate()) && (
        <CardContent className="p-4 border-t flex gap-2">
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConfirm} disabled={!!isProcessing}>
                {isProcessing === 'confirm' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>} Confirm
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleCancel} disabled={!!isProcessing}>
                {isProcessing === 'cancel' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4"/>} Cancel
            </Button>
            <Button asChild variant="outline" size="icon" aria-label="Chat with guest">
              <Link href={`/messages?id=${booking.id}`}>
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
        </CardContent>
      )}
    </Card>
  );
}


export default function HostBookingsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [key, setKey] = useState(0); // Used to force a refetch
  const [filter, setFilter] = useState('all');

  const bookingsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'bookings'), where('hostId', '==', user.uid)) : null),
    [user, firestore, key]
  );

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  const isLoading = isUserLoading || areBookingsLoading;

  const handleAction = () => {
    setKey(prev => prev + 1); // Increment key to trigger refetch
  };
  
  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => b.bookingDate.toDate() - a.bookingDate.toDate());
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!sortedBookings) return [];
    switch (filter) {
      case 'all': return sortedBookings;
      case 'upcoming': return sortedBookings.filter(b => isFuture(b.bookingDate.toDate()));
      case 'past': return sortedBookings.filter(b => isPast(b.bookingDate.toDate()));
      case 'pending': return sortedBookings.filter(b => b.status === 'Pending');
      case 'confirmed': return sortedBookings.filter(b => b.status === 'Confirmed');
      case 'cancelled': return sortedBookings.filter(b => b.status === 'Cancelled');
      default: return sortedBookings;
    }
  }, [sortedBookings, filter]);

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-headline font-bold">Your Bookings</h1>
            <p className="text-muted-foreground">A list of all bookings for your experiences.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Filter Bookings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'upcoming' ? 'default' : 'outline'} onClick={() => setFilter('upcoming')}>Upcoming</Button>
                <Button variant={filter === 'past' ? 'default' : 'outline'} onClick={() => setFilter('past')}>Past</Button>
                <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
                <Button variant={filter === 'confirmed' ? 'default' : 'outline'} onClick={() => setFilter('confirmed')}>Confirmed</Button>
                <Button variant={filter === 'cancelled' ? 'default' : 'outline'} onClick={() => setFilter('cancelled')}>Cancelled</Button>
            </CardContent>
        </Card>

       {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
        ))}
        {filteredBookings?.map((booking) => (
          <HostBookingCardMobile key={booking.id} booking={booking} onAction={handleAction}/>
        ))}
         {!isLoading && filteredBookings?.length === 0 && (
            <Card className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No bookings match this filter.</p>
            </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            A complete list of guest bookings for your experiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experience</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead>Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {filteredBookings?.map((booking) => (
                <HostBookingRow key={booking.id} booking={booking} onAction={handleAction}/>
              ))}
               {!isLoading && filteredBookings?.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                     No bookings match this filter.
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
