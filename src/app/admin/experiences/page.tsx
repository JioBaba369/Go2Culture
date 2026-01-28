
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Experience, Host } from '@/lib/types';
import { MoreHorizontal, Eye, Pause, Trash2, Loader2, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
  useCollection,
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { countries, suburbs } from '@/lib/location-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { pauseExperience, startExperience, deleteExperienceByAdmin } from '@/lib/admin-actions';
import { ADMIN_UID } from '@/lib/auth';


const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  live: 'default',
  paused: 'secondary',
  draft: 'outline',
};

// Sub-component to fetch and render host information for a single experience
function ExperienceRow({ experience, onActionStart, onActionEnd, setExperienceToDelete }: { experience: Experience, onActionStart: () => void, onActionEnd: () => void, setExperienceToDelete: (experience: Experience) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const hostRef = useMemoFirebase(
    () =>
      firestore && experience.userId
        ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId)
        : null,
    [firestore, experience.userId, experience.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);
  
  const handleToggleStatus = async () => {
    onActionStart();
    try {
        if (experience.status === 'live') {
            await pauseExperience(firestore, experience.id);
            toast({ title: 'Experience Paused' });
        } else {
            await startExperience(firestore, experience.id);
            toast({ title: 'Experience Live' });
        }
    } catch(e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
        onActionEnd();
    }
  }

  if (isHostLoading || !host) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <Skeleton className="h-10 w-full" />
        </TableCell>
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
            {hostImage && (
              <AvatarImage
                src={hostImage.imageUrl}
                alt={host.name}
              />
            )}
            <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{host.name}</span>
        </div>
      </TableCell>
      <TableCell>
        {[
          suburbs.find(s => s.id === experience.location.suburb)?.name,
          countries.find(c => c.id === experience.location.country)?.name,
        ].filter(Boolean).join(', ')}
      </TableCell>
      <TableCell>${experience.pricing.pricePerGuest.toFixed(2)}</TableCell>
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
      <TableCell className="text-right">
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
            <DropdownMenuItem onClick={handleToggleStatus}>
                {experience.status === 'live' ? <><Pause className="mr-2 h-4 w-4" />Pause Listing</> : <><Play className="mr-2 h-4 w-4" />Make Live</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setExperienceToDelete(experience)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

function ExperienceCardMobile({ experience, onActionStart, onActionEnd, setExperienceToDelete }: { experience: Experience, onActionStart: () => void, onActionEnd: () => void, setExperienceToDelete: (experience: Experience) => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const hostRef = useMemoFirebase(
    () =>
      firestore && experience.userId
        ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId)
        : null,
    [firestore, experience.userId, experience.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  const handleToggleStatus = async () => {
    onActionStart();
    try {
        if (experience.status === 'live') {
            await pauseExperience(firestore, experience.id);
            toast({ title: 'Experience Paused' });
        } else {
            await startExperience(firestore, experience.id);
            toast({ title: 'Experience Live' });
        }
    } catch(e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
        onActionEnd();
    }
  }

  if (isHostLoading || !host) {
    return <Skeleton className="h-40 w-full" />;
  }
  
  const hostImage = PlaceHolderImages.find(p => p.id === host.profilePhotoId);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar>
            {hostImage && (
              <AvatarImage
                src={hostImage.imageUrl}
                alt={host.name}
              />
            )}
            <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-semibold">{experience.title}</p>
            <p className="text-sm text-muted-foreground">by {host.name}</p>
            <p className="text-xs text-muted-foreground">
              {[
                suburbs.find(s => s.id === experience.location.suburb)?.name,
                countries.find(c => c.id === experience.location.country)?.name,
              ].filter(Boolean).join(', ')}
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
            <DropdownMenuItem onClick={handleToggleStatus}>
                {experience.status === 'live' ? <><Pause className="mr-2 h-4 w-4" />Pause</> : <><Play className="mr-2 h-4 w-4" />Make Live</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setExperienceToDelete(experience)}>
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
          ${experience.pricing.pricePerGuest.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}

export default function AdminExperiencesPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;
  const { toast } = useToast();
  const [isActionRunning, setIsActionRunning] = React.useState(false);
  const [experienceToDelete, setExperienceToDelete] = React.useState<Experience | null>(null);

  const { data: experiences, isLoading } = useCollection<Experience>(
    useMemoFirebase(
      () => (firestore && isAdmin ? collection(firestore, 'experiences') : null),
      [firestore, isAdmin, isActionRunning] // Re-fetch when an action completes
    )
  );

  const handleDelete = async () => {
    if (!experienceToDelete || !firestore) return;
    setIsActionRunning(true);
    try {
        await deleteExperienceByAdmin(firestore, experienceToDelete.id);
        toast({ title: 'Experience Deleted'});
        setExperienceToDelete(null);
    } catch(e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive'});
    } finally {
        setIsActionRunning(false);
    }
  }

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
          <ExperienceCardMobile key={exp.id} experience={exp} onActionStart={() => setIsActionRunning(true)} onActionEnd={() => setIsActionRunning(false)} setExperienceToDelete={setExperienceToDelete} />
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
                <TableHead className="text-right">
                  Actions
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
                <ExperienceRow key={exp.id} experience={exp} onActionStart={() => setIsActionRunning(true)} onActionEnd={() => setIsActionRunning(false)} setExperienceToDelete={setExperienceToDelete}/>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!experienceToDelete} onOpenChange={(open) => !open && setExperienceToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete the experience "{experienceToDelete?.title}". This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isActionRunning}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isActionRunning}>
                    {isActionRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
