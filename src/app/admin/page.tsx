
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardList,
  Utensils,
  Users,
  MessageSquareWarning,
  CheckCircle,
  Clock,
} from "lucide-react";
import { hostApplications, experiences, users } from "@/lib/data";

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
            <p className="text-muted-foreground">Activity feed will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
