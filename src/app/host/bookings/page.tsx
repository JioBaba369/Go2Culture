
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
import { collection, query, where, doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  Confirmed: 'default',
  Pending: 'secondary',
  Cancelled: 'destructive',
};

function HostBookingRow({ booking }: { booking: Booking }) {
  const firestore = useFirestore();
  const guestRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', booking.guestId) : null),
    [firestore, booking.guestId]
  );
  const { data: guest, isLoading } = useDoc<User>(guestRef);

  if (isLoading || !guest) {
    return (
      <TableRow>
        <TableCell colSpan={6}>
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

export default function HostBookingsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const bookingsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'bookings'), where('hostId', '==', user.uid)) : null),
    [firestore, user]
  );

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
          <CardDescription>
            A list of all bookings for your experiences.
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {bookings?.map((booking) => (
                <HostBookingRow key={booking.id} booking={booking} />
              ))}
               {!isLoading && bookings?.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                     You have no bookings yet.
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
