
'use client';

import React, { useState } from 'react';
import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isPast } from 'date-fns';

import { Loader2, Star, ThumbsUp } from 'lucide-react';
import type { Booking, Experience, Review } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitReview } from '@/lib/user-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  comment: z.string().min(10, 'Please write at least 10 characters.'),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;


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
              ratingValue <= (hover || field.value) ? "text-yellow-400" : "text-gray-300"
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


function ReviewForm({ booking, onFinished }: { booking: Booking, onFinished: () => void }) {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  async function onSubmit(values: ReviewFormValues) {
    if (!firestore) return;
    try {
      await submitReview(firestore, booking, values.rating, values.comment);
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

function BookingCard({ booking }: { booking: Booking }) {
  const { firestore } = useFirebase();
  const [isReviewFormOpen, setReviewFormOpen] = useState(false);
  
  const experienceRef = useMemoFirebase(() => (firestore ? doc(firestore, 'experiences', booking.experienceId) : null), [firestore, booking.experienceId]);
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);
  
  // Check if a review already exists for this booking
  const reviewQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'reviews'), where('bookingId', '==', booking.id), where('guestId', '==', booking.guestId)) : null), [firestore, booking.id, booking.guestId]);
  const { data: reviews, isLoading: isReviewLoading } = useCollection<Review>(reviewQuery);
  
  const hasReviewed = reviews && reviews.length > 0;
  const isCompleted = isPast(booking.bookingDate.toDate());
  
  if (isExperienceLoading) return <Skeleton className="h-48 w-full" />;
  if (!experience) return null;

  const image = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);

  return (
    <Card className="flex flex-col md:flex-row overflow-hidden">
      <div className="md:w-1/3 relative h-48 md:h-auto">
        {image && <Image src={image.imageUrl} alt={experience.title} layout="fill" objectFit="cover" />}
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
        <CardFooter className="bg-muted/50 p-4">
          {isCompleted ? (
            isReviewLoading ? <Skeleton className="h-10 w-32" /> :
            hasReviewed ? (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <ThumbsUp className="h-5 w-5" /> Reviewed
              </div>
            ) : (
              <Dialog open={isReviewFormOpen} onOpenChange={setReviewFormOpen}>
                <DialogTrigger asChild>
                  <Button>Leave a Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review your experience: {experience.title}</DialogTitle>
                  </DialogHeader>
                  <ReviewForm booking={booking} onFinished={() => setReviewFormOpen(false)} />
                </DialogContent>
              </Dialog>
            )
          ) : (
            <p className="text-sm text-muted-foreground">This experience is upcoming.</p>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}


export default function MyBookingsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  const bookingsQuery = useMemoFirebase(
    () => (user && firestore ? query(collection(firestore, 'bookings'), where('guestId', '==', user.uid)) : null),
    [user, firestore]
  );
  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile/bookings');
    }
  }, [isUserLoading, user, router]);

  const isLoading = isUserLoading || areBookingsLoading;
  
  if (isLoading) {
    return (
      <div className="py-12">
        <h1 className="text-3xl font-headline font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Your journey with Go2Culture.</p>
        <div className="mt-8 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-12">
      <h1 className="text-3xl font-headline font-bold">My Bookings</h1>
      <p className="text-muted-foreground">Your journey with Go2Culture.</p>

      <div className="mt-8 space-y-6">
        {bookings && bookings.length > 0 ? (
          bookings.sort((a,b) => b.bookingDate.toDate() - a.bookingDate.toDate()).map(booking => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-12 h-80">
            <h3 className="text-xl font-semibold">You haven't booked anything yet.</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">When you book an experience, it will show up here. Let's find your next adventure!</p>
            <Button asChild className="mt-6">
              <Link href="/discover">Discover Experiences</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
