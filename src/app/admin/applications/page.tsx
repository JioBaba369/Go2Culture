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
import { Eye } from "lucide-react";

const statusVariantMap = {
  Pending: "secondary",
  Approved: "default",
  'Changes Needed': "outline",
  Rejected: "destructive",
} as const;


export default function HostApplicationsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Host Applications</h1>
        <p className="text-muted-foreground">Review, approve, and manage host applications.</p>
       </div>
      
      <Card>
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
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>Experience Title</TableHead>
                <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.hostName}</TableCell>
                  <TableCell className="hidden md:table-cell">{app.city}, {app.country}</TableCell>
                  <TableCell>{app.experienceTitle}</TableCell>
                  <TableCell className="hidden sm:table-cell">{app.submittedDate}</TableCell>
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
