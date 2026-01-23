
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { hostApplications } from "@/lib/data";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariantMap: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  Pending: "secondary",
  Approved: "default",
  'Changes Needed': "outline",
  Rejected: "destructive",
};


export default function HostApplicationsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Host Applications</h1>
        <p className="text-muted-foreground">Review, approve, and manage host applications.</p>
       </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">All Applications</h2>
         {hostApplications.map((app) => (
          <Card key={app.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold">{app.hostName}</p>
                <p className="text-sm text-muted-foreground">{app.experience.title}</p>
                <p className="text-xs text-muted-foreground">{app.location.suburb}, {app.location.country}</p>
              </div>
               <Link href={`/admin/applications/${app.id}`} className="text-primary hover:underline flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" /> View
                </Link>
            </div>
             <div className="mt-4 flex items-center justify-between">
              <Badge variant={statusVariantMap[app.status]}>
                {app.status}
              </Badge>
              <p className="text-sm text-muted-foreground">{app.submittedDate}</p>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            A list of all host applications submitted to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience Title</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.hostName}</TableCell>
                  <TableCell>{app.location.suburb}, {app.location.country}</TableCell>
                  <TableCell>{app.experience.title}</TableCell>
                  <TableCell>{app.submittedDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[app.status]}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/applications/${app.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Application</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
