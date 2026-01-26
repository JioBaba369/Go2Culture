'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import type { Booking, Experience, Review, User } from "@/lib/types";
import { Clock, Star, Utensils, CalendarCheck, Users, DollarSign, Hourglass } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format, formatDistanceToNow, isFuture, isPast } from "date-fns";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import React from "react";

const BookingsChart = dynamic(() => import('@/components/host/dashboard-charts').then(mod => mod.BookingsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80" />
});
const EarningsChart = dynamic(() => import('@/components/host/dashboard-charts').then(mod => mod.EarningsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-80" />
});


function ActivityItem({ activity }: { activity: any }) {
    const { firestore } = useFirebase();

    const guestRef = useMemoFirebase(() => (firestore && activity.guestId ? doc(firestore, 'users', activity.guestId) : null), [firestore, activity.guestId]);
    const { data: guest, isLoading } = useDoc<User>(guestRef);
    
    if (isLoading || !guest) {
        return <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2 mt-1" /></div></div>
    }

    const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);
    let title, href;

    switch (activity.type) {
        case 'booking':
            title = <>{guest.fullName} booked your experience: <span className="font-semibold">{activity.experienceTitle}</span></>;
            href = `/host/bookings`;
            break;
        case 'review':
            title = <>{guest.fullName} left a <span className="font-semibold">{activity.rating}-star review</span> for one of your experiences.</>;
            href = `/host/experiences`;
            break;
        default:
            return null;
    }

    return (
        <div className="flex items-center gap-4">
             <Avatar className="h-9 w-9">
                {guestImage && <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} data-ai-hint={guestImage.imageHint} />}
                <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm text-foreground"><Link href={href} className="hover:underline">{title}</Link></p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(activity.date, { addSuffix: true })}</p>
            </div>
        </div>
    );
}

function NextBookingCard({ booking }: { booking: Booking }) {
    const { firestore } = useFirebase();
    const guestRef = useMemoFirebase(() => (firestore ? doc(firestore, 'users', booking.guestId) : null), [firestore, booking.guestId]);
    const { data: guest, isLoading } = useDoc<User>(guestRef);
    const experienceRef = useMemoFirebase(() => (firestore ? doc(firestore, 'experiences', booking.experienceId) : null), [firestore, booking.experienceId]);
    const { data: experience, isLoading: isExpLoading } = useDoc<Experience>(experienceRef);
    
    if (isLoading || isExpLoading || !guest || !experience) {
        return <Skeleton className="h-full w-full" />
    }
    
    const guestImage = PlaceHolderImages.find(p => p.id === guest.profilePhotoId);

    return (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <CalendarCheck />
                    Next Upcoming Booking
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{format(booking.bookingDate.toDate(), 'PPP')}</p>
                <p className="text-muted-foreground font-semibold">{booking.experienceTitle}</p>
                <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        {guestImage && <AvatarImage src={guestImage.imageUrl} alt={guest.fullName} />}
                        <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{guest.fullName}</p>
                        <p className="text-sm text-muted-foreground">{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</p>
                    </div>
                </div>
                 <Button asChild className="w-full mt-4">
                    <Link href="/host/bookings">View Booking Details</Link>
                 </Button>
            </CardContent>
        </Card>
    );
}

const toDate = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
}

export default function HostDashboardPage() {
    const { user, firestore, isUserLoading } = useFirebase();

    const experiencesQuery = useMemoFirebase(() => (user && firestore ? query(collection(firestore, 'experiences'), where('userId', '==', user.uid)) : null), [user, firestore]);
    const { data: experiences, isLoading: experiencesLoading } = useCollection<Experience>(experiencesQuery);
    
    const bookingsQuery = useMemoFirebase(() => (user && firestore ? query(collection(firestore, 'bookings'), where('hostId', '==', user.uid)) : null), [user, firestore]);
    const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);

    const reviewsQuery = useMemoFirebase(() => (user && firestore ? query(collection(firestore, 'reviews'), where('hostId', '==', user.uid)) : null), [user, firestore]);
    const { data: reviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);

    const isLoading = isUserLoading || experiencesLoading || bookingsLoading || reviewsLoading;

    const confirmedBookings = bookings?.filter(b => b.status === 'Confirmed') || [];
    const upcomingConfirmed = confirmedBookings.filter(b => isFuture(b.bookingDate.toDate()));
    const pastConfirmed = confirmedBookings.filter(b => isPast(b.bookingDate.toDate()));
    const pendingBookings = bookings?.filter(b => b.status === 'Pending' && isFuture(b.bookingDate.toDate())) || [];

    const totalPayouts = pastConfirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const upcomingEarnings = upcomingConfirmed.reduce((sum, b) => sum + b.totalPrice, 0);
    const potentialEarnings = pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalGuestsHosted = pastConfirmed.reduce((sum, b) => sum + b.numberOfGuests, 0);

    const averageRating = experiences && experiences.length > 0 && experiences.reduce((acc, exp) => acc + exp.rating.count, 0) > 0
        ? experiences.reduce((acc, exp) => acc + exp.rating.average * exp.rating.count, 0) / experiences.reduce((acc, exp) => acc + exp.rating.count, 0)
        : 0;

    const totalReviews = experiences?.reduce((sum, e) => sum + e.rating.count, 0) || 0;
    
    const nextBooking = upcomingConfirmed.sort((a,b) => a.bookingDate.toDate().getTime() - b.bookingDate.toDate().getTime())[0];

    const stats = [
        { title: "Total Payouts", value: `$${totalPayouts.toFixed(2)}`, icon: DollarSign, description: `From ${pastConfirmed.length} completed bookings.` },
        { title: "Upcoming Earnings", value: `$${upcomingEarnings.toFixed(2)}`, icon: CalendarCheck, description: `From ${upcomingConfirmed.length} future bookings.` },
        { title: "Pending Requests", value: pendingBookings.length, icon: Hourglass, description: `Worth $${potentialEarnings.toFixed(2)}` },
        { title: "Total Guests Hosted", value: totalGuestsHosted, icon: Users, description: 'Across all completed experiences.'},
        { title: "Average Rating", value: isNaN(averageRating) ? 'N/A' : averageRating.toFixed(2), icon: Star, description: `Across ${totalReviews} reviews.` },
    ];
    
    const recentActivities = [
        ...(bookings || []).map(b => ({ type: 'booking', ...b, date: toDate(b.createdAt || b.bookingDate) })),
        ...(reviews || []).map(r => ({ type: 'review', ...r, date: toDate(r.createdAt) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Host Dashboard</h1>

            {nextBooking && <NextBookingCard booking={nextBooking} />}
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {isLoading ? Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-28" />) :
                stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.description && <p className="text-xs text-muted-foreground">{stat.description}</p>}
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BookingsChart bookings={bookings || []} />
                <EarningsChart bookings={bookings || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest bookings and reviews for your experiences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-48 w-full"/> : recentActivities.length > 0 ? (
                            <div className="space-y-6">
                                {recentActivities.map((activity, index) => <ActivityItem key={`${activity.type}-${activity.id}-${index}`} activity={activity} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No recent activity.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button asChild><Link href="/host/experiences">Manage Experiences</Link></Button>
                        <Button asChild variant="outline"><Link href="/host/calendar">Update Calendar</Link></Button>
                        <Button asChild variant="outline"><Link href="/host/bookings">View All Bookings</Link></Button>
                         <Button asChild variant="secondary"><Link href="/profile">Edit Host Profile</Link></Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
