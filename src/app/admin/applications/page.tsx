
'use client';
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
import { Eye, AlertTriangle } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { HostApplication } from "@/lib/types";
import { collection } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const statusVariantMap: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  Pending: "secondary",
  Approved: "default",
  'Changes Needed': "outline",
  Rejected: "destructive",
};


export default function HostApplicationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const applicationsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'hostApplications') : null),
    [firestore, user]
  );
  const { data: hostApplications, isLoading: areAppsLoading, error } = useCollection<HostApplication>(applicationsQuery);
  const isLoading = isAuthLoading || (!!user && areAppsLoading);


  const renderTableRows = (apps: HostApplication[]) => {
    return apps.map((app) => (
      <TableRow key={app.id}>
        <TableCell className="font-medium">{app.hostName}</TableCell>
        <TableCell>{app.location.suburb}, {app.location.country}</TableCell>
        <TableCell>{app.experience.title}</TableCell>
        <TableCell>{app.submittedDate?.toDate ? format(app.submittedDate.toDate(), 'PP') : 'N/A'}</TableCell>
        <TableCell>
          <Badge variant={statusVariantMap[app.status]}>
            {app.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/applications/${app.id}`}>
              <Eye className="mr-2 h-4 w-4"/>
              View
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    ));
  }

  const renderMobileCards = (apps: HostApplication[]) => {
    return apps.map((app) => (
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
          <p className="text-sm text-muted-foreground">{app.submittedDate?.toDate ? format(app.submittedDate.toDate(), 'PP') : 'N/A'}</p>
        </div>
      </Card>
    ));
  }
  
  const tableBodyContent = () => {
    if (isLoading) {
      return Array.from({length: 5}).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Could not load applications. Please check your permissions or try again later.
              </AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }
    if (hostApplications && hostApplications.length > 0) {
      return renderTableRows(hostApplications);
    }
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
          No applications found.
        </TableCell>
      </TableRow>
    );
  };
  
  const mobileContent = () => {
     if (isLoading) {
      return Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />);
    }
    if (error) {
       return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load applications.
          </AlertDescription>
        </Alert>
      );
    }
    if (hostApplications && hostApplications.length > 0) {
      return renderMobileCards(hostApplications);
    }
    return (
      <Card className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">No applications found.</p>
      </Card>
    );
  };
  
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Host Applications</h1>
        <p className="text-muted-foreground">Review, approve, and manage host applications.</p>
       </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        <h2 className="text-xl font-semibold">All Applications</h2>
        {mobileContent()}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableBodyContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
