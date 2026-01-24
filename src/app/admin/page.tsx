
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
  MessageSquareWarning,
  CheckCircle,
  Clock,
  Star,
  UserPlus,
  FileText,
  Tag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { UsersChart, ExperiencesChart } from "@/components/admin/dashboard-charts";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { HostApplication, Experience, User, Review, Coupon } from "@/lib/types";

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'application': return <FileText className="h-5 w-5 text-muted-foreground" />;
        case 'experience': return <Utensils className="h-5 w-5 text-muted-foreground" />;
        case 'user': return <UserPlus className="h-5 w-5 text-muted-foreground" />;
        case 'review': return <Star className="h-5 w-5 text-muted-foreground" />;
        default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
};

const ActivityItem = ({ activity }: { activity: any }) => {
    const timeAgo = formatDistanceToNow(activity.date, { addSuffix: true });

    let title, href, imageId, fallbackName;

    switch (activity.type) {
        case 'application':
            title = <>New application from <span className="font-semibold">{activity.data.hostName}</span></>;
            href = `/admin/applications/${activity.data.id}`;
            imageId = activity.data.profile.photoId;
            fallbackName = activity.data.hostName;
            break;
        case 'experience':
            title = <>New experience created: <span className="font-semibold">{activity.data.title}</span></>;
            href = `/experiences/${activity.data.id}`;
            // The host data is not denormalized on the experience for this view, so we can't show image.
            // imageId = activity.data.host.profilePhotoId;
            fallbackName = activity.data.title;
            break;
        case 'user':
            title = <><span className="font-semibold">{activity.data.fullName}</span> joined Go2Culture</>;
            href = `/admin/users`;
            imageId = activity.data.profilePhotoId;
            fallbackName = activity.data.fullName;
            break;
        case 'review':
             title = <>A guest left a review</>;
             href = `/admin/reports`; // Reviews and reports are on the same page
            // imageId = reviewedUser?.profilePhotoId;
            fallbackName = '?';
            break;
        default:
            title = 'An unknown activity occurred';
            href = '/admin';
            fallbackName = '?';
    }

    const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : null;

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9">
                {image ? <AvatarImage src={image.imageUrl} alt="User" data-ai-hint={image.imageHint} /> : <AvatarFallback>{fallbackName.charAt(0)}</AvatarFallback>}
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

  const { data: hostApplications } = useCollection<HostApplication>(useMemoFirebase(() => firestore ? collection(firestore, 'hostApplications') : null, [firestore]));
  const { data: experiences } = useCollection<Experience>(useMemoFirebase(() => firestore ? collection(firestore, 'experiences') : null, [firestore]));
  const { data: users } = useCollection<User>(useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]));
  const { data: reviews } = useCollection<Review>(useMemoFirebase(() => firestore ? collection(firestore, 'reviews') : null, [firestore]));
  const { data: coupons } = useCollection<Coupon>(useMemoFirebase(() => firestore ? collection(firestore, 'coupons') : null, [firestore]));

  const stats = [
    {
      title: "Pending Applications",
      value: hostApplications?.filter(app => app.status === 'Pending').length || 0,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Approved Hosts",
      value: experiences ? new Set(experiences.map(exp => exp.hostId)).size : 0,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Live Experiences",
      value: experiences?.filter(exp => exp.status === 'live').length || 0,
      icon: Utensils,
      color: "text-purple-500",
    },
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: Users,
      color: "text-orange-500",
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
               <Tag className={`h-4 w-4 text-muted-foreground text-pink-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coupons?.filter(c => c.isActive).length || 0}</div>
            </CardContent>
          </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            <UsersChart users={users || []} />
        </div>
        <div className="lg:col-span-2">
            <ExperiencesChart experiences={experiences || []}/>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            {activities.length > 0 ? (
                <div className="space-y-6">
                    {activities.map((activity, index) => <ActivityItem key={index} activity={activity} />)}
                </div>
            ) : (
                <p className="text-muted-foreground">No recent activity to display.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
