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

const stats = [
  {
    title: "Pending Applications",
    value: "12",
    icon: Clock,
    color: "text-blue-500",
  },
  {
    title: "Approved Hosts",
    value: "234",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Live Experiences",
    value: "189",
    icon: Utensils,
    color: "text-purple-500",
  },
  {
    title: "Total Users",
    value: "1,204",
    icon: Users,
    color: "text-orange-500",
  },
  {
    title: "Flagged Listings",
    value: "3",
    icon: MessageSquareWarning,
    color: "text-yellow-500",
  },
  {
    title: "Reported Issues",
    value: "5",
    icon: MessageSquareWarning,
    color: "text-red-500",
  },
];

export default function AdminDashboardPage() {
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
