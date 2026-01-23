
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
      
       {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">Active Reports</h2>
         {reports.map((report) => (
          <Card key={report.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold">{report.reason}</p>
                <p className="text-sm text-muted-foreground">
                  Reported by: <span className="font-medium">{report.reportedBy}</span>
                </p>
                <p className="text-xs text-muted-foreground">Target: {report.targetType} ({report.targetId})</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
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
            </div>
             <div className="mt-4 flex items-center justify-between">
              <Badge variant={statusVariantMap[report.status]} className="capitalize">
                {report.status}
              </Badge>
              <p className="text-sm text-muted-foreground">{format(new Date(report.date), 'PP')}</p>
            </div>
          </Card>
        ))}
      </div>


      {/* Desktop Table View */}
      <Card className="hidden md:block">
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
                <TableHead>Reason</TableHead>
                <TableHead>Reported By</TableHead>
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
                  <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                  <TableCell>
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
