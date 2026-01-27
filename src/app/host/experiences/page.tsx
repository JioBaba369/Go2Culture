
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Experience, User } from '@/lib/types';
import { MoreHorizontal, Eye, Pause, Play, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pauseExperienceForHost, startExperienceForHost, deleteExperienceForHost } from '@/lib/host-actions';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive' | null | undefined
> = {
  live: 'default',
  paused: 'secondary',
  draft: 'outline',
};

export default function HostExperiencesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const experiencesQuery = useMemoFirebase(
    () =>
      user && firestore
        ? query(collection(firestore, 'experiences'), where('userId', '==', user.uid))
        : null,
    [user, firestore]
  );
  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(experiencesQuery);
  const isLoading = isUserLoading || areExperiencesLoading;

  const handleToggleStatus = async (experience: Experience) => {
    if (!firestore || !user) return;
    setIsToggling(experience.id);
    try {
      if (experience.status === 'live') {
        await pauseExperienceForHost(firestore, user, experience.id);
        toast({ title: 'Experience Paused', description: `"${experience.title}" is no longer live.` });
      } else {
        await startExperienceForHost(firestore, user, experience.id);
        toast({ title: 'Experience Live', description: `"${experience.title}" is now visible to guests.` });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update the experience status.',
      });
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!experienceToDelete || !firestore || !user) return;
    setIsDeleting(true);
    try {
        await deleteExperienceForHost(firestore, user, experienceToDelete.id);
        toast({ title: 'Experience Deleted', description: `"${experienceToDelete.title}" has been removed.`});
        setExperienceToDelete(null);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Delete Failed',
            description: error.message || 'Could not delete the experience.',
        });
    } finally {
        setIsDeleting(false);
    }
  };

  const renderRow = (experience: Experience) => {
    const isTogglingThis = isToggling === experience.id;
    const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);

    return (
      <TableRow key={experience.id}>
        <TableCell>
            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                {mainImage && <Image src={mainImage.imageUrl} alt={experience.title} fill className="object-cover" sizes="96px" data-ai-hint={mainImage.imageHint} />}
            </div>
        </TableCell>
        <TableCell className="font-medium">{experience.title}</TableCell>
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
        <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/host/experiences/${experience.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isTogglingThis}>
                            {isTogglingThis ? <Skeleton className="h-4 w-4 rounded-full" /> : <MoreHorizontal className="h-4 w-4" />}
                            <span className="sr-only">Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/experiences/${experience.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View as Guest
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(experience)} className="cursor-pointer">
                            {experience.status === 'live' ? (
                            <><Pause className="mr-2 h-4 w-4" /> Pause</>
                            ) : (
                            <><Play className="mr-2 h-4 w-4" /> Make Live</>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setExperienceToDelete(experience)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </TableCell>
      </TableRow>
    );
  };
  
  const renderCard = (experience: Experience) => {
      const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
      const isTogglingThis = isToggling === experience.id;

      return (
        <Card key={experience.id} className="flex flex-col">
            <CardContent className="p-4 flex-grow">
                 <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        {mainImage && <Image src={mainImage.imageUrl} alt={experience.title} fill className="object-cover" sizes="96px" data-ai-hint={mainImage.imageHint} />}
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold leading-tight">{experience.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">${experience.pricing.pricePerGuest} / person</p>
                        <div className="mt-2">
                            <Badge variant={statusVariantMap[experience.status]} className="capitalize">
                                {experience.status}
                            </Badge>
                        </div>
                    </div>
                 </div>
            </CardContent>
            <CardFooter className="p-2 border-t bg-muted/50 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/host/experiences/${experience.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Link>
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isTogglingThis}>
                        {isTogglingThis ? <Skeleton className="h-4 w-4 rounded-full" /> : <MoreHorizontal className="h-4 w-4" />}
                        <span className="sr-only">Actions</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/experiences/${experience.id}`} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View as Guest
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(experience)} className="cursor-pointer">
                        {experience.status === 'live' ? (
                          <><Pause className="mr-2 h-4 w-4" /> Pause</>
                        ) : (
                          <><Play className="mr-2 h-4 w-4" /> Make Live</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setExperienceToDelete(experience)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
      );
  }

  const emptyState = (
    <div className="text-center text-muted-foreground py-10 px-4 border-2 border-dashed rounded-lg">
      <h3 className="text-lg font-semibold text-foreground">No experiences yet</h3>
      <p className="mt-1 mb-4">It looks like you haven't created any experiences. Let's create your first one!</p>
      <Button asChild>
          <Link href="/become-a-host/apply">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Experience
          </Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Your Experiences</CardTitle>
            <CardDescription>
              Manage your current listings and create new ones.
            </CardDescription>
          </div>
           <Button asChild>
                <Link href="/become-a-host/apply">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Experience
                </Link>
            </Button>
        </CardHeader>
        <CardContent>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
                {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
                {experiences && experiences.length > 0 ? experiences.map(renderCard) : !isLoading && emptyState}
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-32"><span className="sr-only">Image</span></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading &&
                        Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={6}>
                            <Skeleton className="h-16 w-full" />
                            </TableCell>
                        </TableRow>
                        ))}
                    {experiences && experiences.length > 0 ? experiences.map(renderRow) : !isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="py-10">
                              {emptyState}
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!experienceToDelete} onOpenChange={(open) => !open && setExperienceToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the experience <span className="font-medium">"{experienceToDelete?.title}"</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Delete Permanently
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    