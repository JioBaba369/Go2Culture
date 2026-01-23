
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { reports } from "@/lib/data";

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
  Open: "destructive",
  'In Progress': "secondary",
  Resolved: "default",
};

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Reviews & Reports</h1>
        <p className="text-muted-foreground">Manage user-submitted reports and system flags.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Reports</CardTitle>
          <CardDescription>
            A list of all reports that require administrative attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead className="hidden md:table-cell">Reason</TableHead>
                <TableHead className="hidden sm:table-cell">Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                      <div className="font-medium">{report.targetType}</div>
                      <div className="text-xs text-muted-foreground">{report.targetId}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {report.reportedUserLink ? (
                        <Link href={report.reportedUserLink} className="hover:underline">{report.reportedBy}</Link>
                    ) : (
                        <span>{report.reportedBy}</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(report.date), 'PP')}</TableCell>
                   <TableCell>
                      <Badge variant={statusVariantMap[report.status]} className="capitalize">
                        {report.status}
                      </Badge>
                    </TableCell>
                  <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Suspend User</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Content</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
