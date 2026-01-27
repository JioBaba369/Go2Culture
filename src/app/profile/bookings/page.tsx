
'use client';

import React, { useState, useMemo } from 'react';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isPast } from 'date-fns';

import { Loader2, Star, ThumbsUp, MessageSquare, X, Hourglass, CalendarIcon } from 'lucide-react';
import type { Booking, Experience, Review, User, Host } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitReview, cancelBookingByGuest, requestReschedule } from '@/lib/user-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BookingDatePicker } from '@/components/ui/booking-date-picker';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  comment: z.string().min(10, 'Please write at least 10 characters.'),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

const rescheduleSchema = z.object({
  newDate: z.date({ required_error: "Please select a new date." }),
});
type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

function StarRating({ field }: { field: any }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className={cn(
              "p-1 transition-colors",
              ratingValue <= (hover || field.value) ? "text-accent" : "text-muted-foreground/50"
            )}
            onClick={() => field.onChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star className="h-8 w-8" fill="currentColor" />
          </button>
        );
      })}
    </div>
  );
}

function ReviewForm({ booking, actor, onFinished }: { booking: Booking, actor: User, onFinished: () => void }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  async function onSubmit(values: ReviewFormValues) {
    if (!firestore) return;
    try {
      await submitReview(firestore, actor, booking, values.rating, values.comment);
      toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
      onFinished();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating</FormLabel>
              <FormControl><StarRating field={field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl><Textarea rows={5} placeholder="Tell us about your experience..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function RescheduleForm({ booking, experience, host, actor, onFinished }: { booking: Booking, experience: Experience, host: Host, actor: User, onFinished: () => void }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
  });

  async function onSubmit(values: RescheduleFormValues) {
    if (!firestore || !actor) return;
    try {
      await requestReschedule(firestore, actor, booking.id, values.newDate);
      toast({ title: 'Reschedule Request Sent!', description: 'The host has been notified of your request.' });
      onFinished();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Request Failed', description: error.message });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Date</FormLabel>
              <FormControl>
                <BookingDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    availableDays={experience.availability.days}
                    blockedDates={host?.blockedDates}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Request
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}


function BookingCard({ booking, actor, onAction, hasReviewed, isReviewCheckLoading }: { booking: Booking, actor: User | null, onAction: () => void, hasReviewed: boolean, isReviewCheckLoading: boolean }) {
  const { firestore } = useFirebase();
  const [isReviewFormOpen, setReviewFormOpen] = useState(false);
  const [isRescheduleOpen, setRescheduleOpen] = useState(false);
  const [isCancelling, setCancelling] = useState(false);
  const { toast } = useToast();
  
  const experienceRef = useMemoFirebase(() => (firestore ? doc(firestore, 'experiences', booking.experienceId) : null), [firestore, booking.experienceId]);
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);
  
  const hostUserRef = useMemoFirebase(() => (firestore ? doc(firestore, 'users', booking.hostId) : null), [firestore, booking.hostId]);
  const { data: hostUser, isLoading: isHostUserLoading } = useDoc<User>(hostUserRef);
  
  const hostProfileRef = useMemoFirebase(() => (firestore && hostUser ? doc(firestore, 'users', hostUser.id, 'hosts', hostUser.id) : null), [firestore, hostUser]);
  const { data: hostProfile, isLoading: isHostProfileLoading } = useDoc<Host>(hostProfileRef);

  const isCompleted = isPast(booking.bookingDate.toDate());
  
  const handleCancel = async () => {
    if (!actor) return;
    setCancelling(true);
    try {
      await cancelBookingByGuest(firestore, actor, booking.id);
      toast({ title: "Booking Cancelled", variant: 'destructive' });
      onAction();
    } catch(e) {
      toast({ title: "Error", description: "Failed to cancel booking.", variant: 'destructive' });
    }
    setCancelling(false);
  }

  if (isExperienceLoading || isHostUserLoading || isHostProfileLoading) return <Skeleton className="h-56 w-full" />;
  if (!experience || !hostUser || !hostProfile || !actor) return null;

  const image = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden">
      <div className="md:w-1/3 relative h-48 md:h-auto">
        {image && <Image src={image.imageUrl} alt={experience.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />}
      </div>
      <div className="md:w-2/3 flex flex-col">
        <CardHeader>
          <CardTitle>{experience.title}</CardTitle>
          <CardDescription>Hosted by {booking.hostName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2">
          <p><strong>Date:</strong> {format(booking.bookingDate.toDate(), 'PPP')}</p>
          <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
          <p><strong>Total Paid:</strong> ${booking.totalPrice.toFixed(2)}</p>
          <Badge>{booking.status}</Badge>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex flex-wrap items-center gap-2">
            {isCompleted && booking.status === 'Confirmed' ? (
                isReviewCheckLoading ? <Skeleton className="h-10 w-32" /> :
                hasReviewed ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm p-2">
                    <ThumbsUp className="h-4 w-4" /> Reviewed
                </div>
                ) : (
                <Dialog open={isReviewFormOpen} onOpenChange={setReviewFormOpen}>
                    <DialogTrigger asChild>
                    <Button size="sm">Leave a Review</Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review: {experience.title}</DialogTitle>
                    </DialogHeader>
                    <ReviewForm booking={booking} actor={actor} onFinished={() => { setReviewFormOpen(false); onAction(); }} />
                    </DialogContent>
                </Dialog>
                )
            ) : booking.status !== 'Cancelled' && !booking.rescheduleRequest ? (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isCancelling}>
                            {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2 h-4 w-4"/>}
                            Cancel
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently cancel your booking.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Back</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancel}>Confirm Cancellation</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : null}

            {!isCompleted && booking.status === 'Confirmed' && !booking.rescheduleRequest && (
              <Dialog open={isRescheduleOpen} onOpenChange={setRescheduleOpen}>
                  <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Reschedule</Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogHeader>
                          <DialogTitle>Request to Reschedule</DialogTitle>
                          <DialogDescription>Select a new date for "{experience.title}". The host will need to approve this change.</DialogDescription>
                      </DialogHeader>
                      <RescheduleForm booking={booking} experience={experience} host={hostProfile} actor={actor} onFinished={() => { setRescheduleOpen(false); onAction(); }} />
                  </DialogContent>
              </Dialog>
            )}

            {booking.rescheduleRequest?.status === 'pending' && (
              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium p-2">
                  <Hourglass className="h-4 w-4" /> Reschedule request pending
              </div>
            )}
             {booking.rescheduleRequest?.status === 'declined' && (
              <div className="flex items-center gap-2 text-sm text-destructive font-medium p-2">
                  <X className="h-4 w-4" /> Reschedule declined
              </div>
            )}

             <Button asChild variant="outline" size="sm">
                <Link href={`/messages?id=${booking.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4"/>
                    Chat with Host
                </Link>
            </Button>
        </CardFooter>
      </div>
    </Card>
  );
}


export default function MyBookingsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const [key, setKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const bookingsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'bookings'), where('guestId', '==', user.uid)) : null),
    [user, firestore, key]
  );
  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);
  
  const userReviewsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'reviews'), where('guestId', '==', user.uid)) : null),
    [user, firestore, key]
  );
  const { data: userReviews, isLoading: areReviewsLoading } = useCollection<Review>(userReviewsQuery);

  const reviewedBookingIds = useMemo(() => userReviews?.map(r => r.bookingId) || [], [userReviews]);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile/bookings');
    }
  }, [isUserLoading, user, router]);
  
  const handleAction = () => {
    setKey(prev => prev + 1); // Force re-fetch of bookings
  };

  const isLoading = isUserLoading || areBookingsLoading || areReviewsLoading;
  
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    const sortedBookings = [...bookings].sort((a,b) => b.bookingDate.toDate() - a.bookingDate.toDate());

    switch (activeFilter) {
      case 'all':
        return sortedBookings;
      case 'Confirmed':
        return sortedBookings.filter(b => b.status === 'Confirmed');
      case 'Pending':
        return sortedBookings.filter(b => b.status === 'Pending');
      case 'to-review':
        return sortedBookings.filter(
          b => isPast(b.bookingDate.toDate()) && b.status === 'Confirmed' && !reviewedBookingIds.includes(b.id)
        );
      case 'past':
        return sortedBookings.filter(b => isPast(b.bookingDate.toDate()));
      case 'Cancelled':
        return sortedBookings.filter(b => b.status === 'Cancelled');
      default:
        return sortedBookings;
    }
  }, [bookings, activeFilter, reviewedBookingIds]);

  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Pending", value: "Pending" },
    { label: "To Review", value: "to-review" },
    { label: "Past", value: "past" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-headline font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Your journey with Go2Culture.</p>
        <div className="mt-8 space-y-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold">My Bookings</h1>
      <p className="text-muted-foreground">Your journey with Go2Culture.</p>
      
      <div className="flex flex-wrap gap-2 my-8">
        {filterOptions.map(filter => (
            <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'default' : 'outline'}
                onClick={() => setActiveFilter(filter.value)}
                size="sm"
            >
                {filter.label}
            </Button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {filteredBookings && filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard 
                key={booking.id} 
                booking={booking}
                actor={user}
                onAction={handleAction} 
                hasReviewed={reviewedBookingIds.includes(booking.id)}
                isReviewCheckLoading={areReviewsLoading}
            />
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-80">
            <h3 className="text-xl font-semibold">No bookings found for this filter.</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Try selecting a different filter or booking an experience!</p>
            <Button asChild className="mt-6">
              <Link href="/discover">Discover Experiences</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

    