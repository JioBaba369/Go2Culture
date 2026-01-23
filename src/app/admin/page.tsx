
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { hostApplications, experiences, users, reviews } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

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
            imageId = activity.data.host.avatarImageId;
            fallbackName = activity.data.host.name;
            break;
        case 'user':
            title = <><span className="font-semibold">{activity.data.fullName}</span> joined Go2Culture</>;
            href = `/admin/users`;
            imageId = activity.data.profilePhotoId;
            fallbackName = activity.data.fullName;
            break;
        case 'review':
            const reviewedUser = users.find(u => u.id === activity.data.userId);
            const reviewedExperience = experiences.find(e => e.id === activity.data.experienceId);
            title = <><span className="font-semibold">{reviewedUser?.fullName || 'A guest'}</span> left a review for <span className="font-semibold">{reviewedExperience?.title || 'an experience'}</span></>;
            href = `/admin/reports`; // Reviews and reports are on the same page
            imageId = reviewedUser?.profilePhotoId;
            fallbackName = reviewedUser?.fullName || '?';
            break;
        default:
            title = 'An unknown activity occurred';
            href = '/admin';
            fallbackName = '?';
    }

    const image = PlaceHolderImages.find(p => p.id === imageId);

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

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Pending Applications",
      value: hostApplications.filter(app => app.status === 'Pending').length,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: "Approved Hosts",
      value: new Set(experiences.map(exp => exp.hostId)).size,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Live Experiences",
      value: experiences.filter(exp => exp.status === 'live').length,
      icon: Utensils,
      color: "text-purple-500",
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-orange-500",
    },
    {
      title: "Flagged Listings",
      value: "3", // mock
      icon: MessageSquareWarning,
      color: "text-yellow-500",
    },
    {
      title: "Reported Issues",
      value: "5", // mock
      icon: MessageSquareWarning,
      color: "text-red-500",
    },
  ];

  const activities = [
    ...hostApplications.map(app => ({ type: 'application', data: app, date: new Date(app.submittedDate) })),
    ...experiences.map(exp => ({ type: 'experience', data: exp, date: new Date(exp.createdAt) })),
    ...users.map(user => ({ type: 'user', data: user, date: new Date(user.createdAt) })),
    ...reviews.map(review => ({ type: 'review', data: review, date: new Date(review.createdAt) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 7);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
