
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
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Booking, User } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc } from '@/firebase/firestore/use-doc';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  Confirmed: 'default',
  Pending: 'secondary',
  Cancelled: 'destructive',
};

// This component is needed to fetch guest info for each booking row without waterfalls in the main component
function BookingRow({ booking }: { booking: Booking }) {
  const firestore = useFirestore();
  const guestRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', booking.guestId) : null),
    [firestore, booking.guestId]
  );
  const { data: guest, isLoading } = useDoc<User>(guestRef);

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
      <TableCell>{booking.hostName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8">
            {guestImage && (
              <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} />
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
    </TableRow>
  )
}

function BookingCardMobile({ booking }: { booking: Booking }) {
  const firestore = useFirestore();
  const guestRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', booking.guestId) : null),
    [firestore, booking.guestId]
  );
  const { data: guest, isLoading } = useDoc<User>(guestRef);

  if (isLoading || !guest) {
    return <Skeleton className="h-36 w-full" />;
  }

  const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);

  return (
    <Card key={booking.id} className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold">{booking.experienceTitle}</p>
          <p className="text-sm text-muted-foreground">Host: {booking.hostName}</p>
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-6 w-6">
              {guestImage && <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} />}
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
    </Card>
  );
}


export default function AdminBookingsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(
    useMemoFirebase(
      () => (firestore && user ? collection(firestore, 'bookings') : null),
      [firestore, user]
    )
  );

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Bookings</h1>
        <p className="text-muted-foreground">
          Review all bookings made on the platform.
        </p>
      </div>

       {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
        ))}
        {bookings?.map((booking) => (
          <BookingCardMobile key={booking.id} booking={booking} />
        ))}
         {!isLoading && bookings?.length === 0 && (
            <Card className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No bookings found.</p>
            </Card>
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            A complete list of all guest bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experience</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
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
              {bookings?.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
               {!isLoading && bookings?.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                     No bookings found.
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

    
