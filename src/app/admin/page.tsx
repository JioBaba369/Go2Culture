
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Utensils,
  Users,
  Clock,
  Star,
  FileText,
  DollarSign,
  CalendarCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { HostApplication, Experience, User, Review, Booking } from "@/lib/types";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_UID } from "@/lib/auth";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const UsersChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.UsersChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const ExperiencesChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.ExperiencesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const BookingsChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.BookingsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const EarningsChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.EarningsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const UserRolesChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.UserRolesChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});
const ExperienceStatusChart = dynamic(() => import('@/components/admin/dashboard-charts').then(mod => mod.ExperienceStatusChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px]" />
});


const ActivityItem = ({ activity }: { activity: any }) => {
    const firestore = useFirestore();
    const timeAgo = formatDistanceToNow(activity.date, { addSuffix: true });

    let title, href, imageURL, fallbackName: string = '?';

    // Different activities have different data structures, so we fetch related data differently.
    const guestRef = useMemoFirebase(() => (firestore && activity.type === 'review' ? doc(firestore, 'users', activity.data.guestId) : null), [firestore, activity]);
    const { data: guest } = useDoc<User>(guestRef);
    
    switch (activity.type) {
        case 'application':
            title = <>New application from <span className="font-semibold">{activity.data.hostName}</span></>;
            href = `/admin/applications/${activity.data.id}`;
            imageURL = PlaceHolderImages.find(p => p.id === activity.data.profile.profilePhotoId)?.imageUrl;
            fallbackName = activity.data.hostName || '?';
            break;
        case 'experience':
            title = <>New experience created: <span className="font-semibold">{activity.data.title}</span></>;
            href = `/experiences/${activity.data.id}`;
            imageURL = PlaceHolderImages.find(p => p.id === activity.data.hostProfilePhotoId)?.imageUrl;
            fallbackName = activity.data.hostName || '?';
            break;
        case 'user':
            title = <><span className="font-semibold">{activity.data.fullName}</span> joined Go2Culture</>;
            href = `/admin/users`;
            imageURL = PlaceHolderImages.find(p => p.id === activity.data.profilePhotoId)?.imageUrl;
            fallbackName = activity.data.fullName || '?';
            break;
        case 'review':
             if (guest) {
                title = <><span className="font-semibold">{guest.fullName}</span> left a review</>;
                imageURL = PlaceHolderImages.find(p => p.id === guest.profilePhotoId)?.imageUrl;
                fallbackName = guest.fullName || '?';
             } else {
                 title = 'A new review was submitted';
                 fallbackName = '?';
             }
             href = `/admin/reports`;
            break;
        default:
            title = 'An unknown activity occurred';
            href = '/admin';
            fallbackName = '?';
    }

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
                {imageURL ? <AvatarImage src={imageURL} alt={fallbackName} /> : <AvatarFallback>{fallbackName ? fallbackName.charAt(0) : '?'}</AvatarFallback>}
            </Avatar>
            <div className="flex-1">
                <p className="text-sm text-foreground hover:underline"><Link href={href}>{title}</Link></p>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
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

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;

  const { data: hostApplications } = useCollection<HostApplication>(useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'hostApplications') : null, [firestore, isAdmin]));
  const { data: experiences } = useCollection<Experience>(useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'experiences') : null, [firestore, isAdmin]));
  const { data: users } = useCollection<User>(useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'users') : null, [firestore, isAdmin]));
  const { data: reviews } = useCollection<Review>(useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'reviews') : null, [firestore, isAdmin]));
  const { data: bookings } = useCollection<Booking>(useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'bookings') : null, [firestore, isAdmin]));

  const totalBookings = bookings?.length || 0;
  const totalRevenue = bookings?.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + b.totalPrice, 0) * 0.15 || 0;

  const stats = [
    {
      title: "Pending Applications",
      value: hostApplications?.filter(app => app.status === 'Pending').length || 0,
      icon: Clock,
      href: "/admin/applications"
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      href: "/admin/bookings"
    },
    {
      title: "Live Experiences",
      value: experiences?.filter(exp => exp.status === 'live').length || 0,
      icon: Utensils,
      href: "/admin/experiences"
    },
     {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      href: "/admin/users"
    },
    {
      title: "Est. Total Revenue",
      value: `$${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      href: "/admin/payouts"
    },
  ];

  const activities = [
    ...(hostApplications || []).map(app => ({ type: 'application', data: app, date: toDate(app.submittedDate) })),
    ...(experiences || []).map(exp => ({ type: 'experience', data: exp, date: toDate(exp.createdAt) })),
    ...(users || []).map(user => ({ type: 'user', data: user, date: toDate(user.createdAt) })),
    ...(reviews || []).map(review => ({ type: 'review', data: review, date: toDate(review.createdAt) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-muted-foreground`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <BookingsChart bookings={bookings || []} />
         <EarningsChart bookings={bookings || []} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <UsersChart users={users || []} />
        </div>
        <div className="lg:col-span-2">
            <ExperiencesChart experiences={experiences || []}/>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRolesChart users={users || []} />
        <ExperienceStatusChart experiences={experiences || []} />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            {activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map((activity, index) => <ActivityItem key={`${activity.type}-${activity.data.id}-${index}`} activity={activity} />)}
                </div>
            ) : (
                <p className="text-muted-foreground">No recent activity to display.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
