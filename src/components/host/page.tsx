
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import type { Booking, Experience, Review, User } from "@/lib/types";
import { Clock, Star, Utensils, CalendarCheck, Users, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { useDoc } from "@/firebase/firestore/use-doc";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingsChart, EarningsChart } from "@/components/host/dashboard-charts";

function ActivityItem({ activity }: { activity: any }) {
    const { firestore } = useFirebase();

    const guestRef = useMemoFirebase(() => (firestore && activity.guestId ? doc(firestore, 'users', activity.guestId) : null), [firestore, activity.guestId]);
    const { data: guest, isLoading } = useDoc<User>(guestRef);
    
    if (isLoading || !guest) {
        return <div className="flex items-center gap-4"><Skeleton className="h-9 w-9 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2 mt-1" /></div></div>
    }

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
                {guest.profilePhotoURL && <AvatarImage src={guest.profilePhotoURL} alt={guest.fullName} />}
                <AvatarFallback>{guest.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm text-foreground"><Link href={href} className="hover:underline">{title}</Link></p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(activity.date, { addSuffix: true })}</p>
            </div>
        </div>
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

    const upcomingBookings = bookings?.filter(b => b.bookingDate.toDate() > new Date()) || [];
    const totalEarnings = bookings?.filter(b => b.status === 'Confirmed').reduce((acc, b) => acc + b.totalPrice, 0) || 0;
    const averageRating = experiences && experiences.length > 0
        ? experiences.reduce((acc, exp) => acc + exp.rating.average * exp.rating.count, 0) / experiences.reduce((acc, exp) => acc + exp.rating.count, 0)
        : 0;

    const stats = [
        { title: "Upcoming Bookings", value: upcomingBookings.length, icon: Clock },
        { title: "Live Experiences", value: experiences?.filter(e => e.status === 'live').length || 0, icon: Utensils },
        { title: "Average Rating", value: isNaN(averageRating) ? 'N/A' : averageRating.toFixed(2), icon: Star },
        { title: "Total Payouts", value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign },
    ];
    
    const recentActivities = [
        ...(bookings || []).map(b => ({ type: 'booking', ...b, date: toDate(b.createdAt) })),
        ...(reviews || []).map(r => ({ type: 'review', ...r, date: toDate(r.createdAt) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Host Dashboard</h1>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28" />) :
                stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                    </>
                ) : (
                    <>
                        <BookingsChart bookings={bookings || []} />
                        <EarningsChart bookings={bookings || []} />
                    </>
                )}
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
                                {recentActivities.map((activity) => <ActivityItem key={`${activity.type}-${activity.id}`} activity={activity} />)}
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

    