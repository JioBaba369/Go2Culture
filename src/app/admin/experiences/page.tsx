
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
import Link from "next/link";
import { Experience, Host } from "@/lib/types";
import { MoreHorizontal, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { format } from 'date-fns';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
  live: "default",
  paused: "secondary",
  draft: "outline",
};

// Sub-component to fetch and render host information for a single experience
function ExperienceRow({ experience }: { experience: Experience }) {
  const firestore = useFirestore();

  const hostRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId) : null),
    [firestore, experience.userId, experience.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  if (isHostLoading || !host) {
    return (
      <TableRow>
        <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
      </TableRow>
    );
  }
  
  const hostImage = PlaceHolderImages.find(p => p.id === host.profilePhotoId);

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="grid gap-0.5">
            <span className="font-semibold">{experience.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {hostImage && <AvatarImage src={hostImage.imageUrl} alt={host.name} data-ai-hint={hostImage.imageHint} />}
              <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{host.name}</span>
        </div>
      </TableCell>
      <TableCell>{experience.location.suburb}, {experience.location.country}</TableCell>
      <TableCell>${experience.pricing.pricePerGuest}</TableCell>
      <TableCell>
        {experience.createdAt?.toDate ? format(experience.createdAt.toDate(), 'PP') : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={statusVariantMap[experience.status]} className="capitalize">
          {experience.status}
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
            <DropdownMenuItem asChild>
                <Link href={`/experiences/${experience.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-4 w-4" /> View Experience
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Pause Listing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function AdminExperiencesPage() {
  const firestore = useFirestore();
  const { data: experiences, isLoading } = useCollection<Experience>(useMemoFirebase(() => firestore ? collection(firestore, 'experiences') : null, [firestore]));

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-headline font-bold">Experiences</h1>
        <p className="text-muted-foreground">Manage all experiences on the platform.</p>
       </div>

      {/* Mobile view not implemented for this refactor to save complexity */}
      
      <Card>
        <CardHeader>
          <CardTitle>All Experiences</CardTitle>
          <CardDescription>
            A list of all experiences created by hosts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experience</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                 <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))}
              {experiences?.map((exp) => <ExperienceRow key={exp.id} experience={exp} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
