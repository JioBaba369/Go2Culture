'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Experience, Host } from '@/lib/types';
import { MoreHorizontal, Eye, Pause, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  live: 'default',
  paused: 'secondary',
  draft: 'outline',
};

// Sub-component to fetch and render host information for a single experience
function ExperienceRow({ experience }: { experience: Experience }) {
  const firestore = useFirestore();

  const hostRef = useMemoFirebase(
    () =>
      firestore && experience.userId
        ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId)
        : null,
    [firestore, experience.userId, experience.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  if (isHostLoading || !host) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-10 w-full" />
        </TableCell>
      </TableRow>
    );
  }

  const hostImage = PlaceHolderImages.find(
    (p) => p.id === host.profilePhotoId
  );

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
            {hostImage && (
              <AvatarImage
                src={hostImage.imageUrl}
                alt={host.name}
                data-ai-hint={hostImage.imageHint}
              />
            )}
            <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{host.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {experience.location.suburb}, {experience.location.country}
      </TableCell>
      <TableCell>${experience.pricing.pricePerGuest}</TableCell>
      <TableCell>
        {experience.createdAt?.toDate
          ? format(experience.createdAt.toDate(), 'PP')
          : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge
          variant={statusVariantMap[experience.status]}
          className="capitalize"
        >
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
              <Link
                href={`/experiences/${experience.id}`}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" /> View Experience
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pause className="mr-2 h-4 w-4" />
              Pause Listing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ExperienceCardMobile({ experience }: { experience: Experience }) {
  const firestore = useFirestore();

  const hostRef = useMemoFirebase(
    () =>
      firestore && experience.userId
        ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId)
        : null,
    [firestore, experience.userId, experience.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  if (isHostLoading || !host) {
    return <Skeleton className="h-40 w-full" />;
  }

  const hostImage = PlaceHolderImages.find(
    (p) => p.id === host.profilePhotoId
  );

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar>
            {hostImage && (
              <AvatarImage
                src={hostImage.imageUrl}
                alt={host.name}
                data-ai-hint={hostImage.imageHint}
              />
            )}
            <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-semibold">{experience.title}</p>
            <p className="text-sm text-muted-foreground">by {host.name}</p>
            <p className="text-xs text-muted-foreground">
              {experience.location.suburb}, {experience.location.country}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={`/experiences/${experience.id}`}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" /> View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pause className="mr-2 h-4 w-4" /> Pause
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Badge
          variant={statusVariantMap[experience.status]}
          className="capitalize"
        >
          {experience.status}
        </Badge>
        <p className="text-sm font-bold">
          ${experience.pricing.pricePerGuest}
        </p>
      </div>
    </Card>
  );
}

export default function AdminExperiencesPage() {
  const firestore = useFirestore();
  const { data: experiences, isLoading } = useCollection<Experience>(
    useMemoFirebase(
      () => (firestore ? collection(firestore, 'experiences') : null),
      [firestore]
    )
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Experiences</h1>
        <p className="text-muted-foreground">
          Manage all experiences on the platform.
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        {experiences?.map((exp) => (
          <ExperienceCardMobile key={exp.id} experience={exp} />
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
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
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {experiences?.map((exp) => (
                <ExperienceRow key={exp.id} experience={exp} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
