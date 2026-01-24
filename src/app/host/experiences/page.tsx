
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
import { Experience } from '@/lib/types';
import { MoreHorizontal, Eye, Pause, Play, Edit, Trash2, PlusCircle } from 'lucide-react';
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
import { pauseExperienceForHost, startExperienceForHost } from '@/lib/host-actions';
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
    if (!firestore) return;
    setIsToggling(experience.id);
    try {
      if (experience.status === 'live') {
        await pauseExperienceForHost(firestore, experience.id);
        toast({ title: 'Experience Paused', description: `"${experience.title}" is no longer live.` });
      } else {
        await startExperienceForHost(firestore, experience.id);
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

  const renderRow = (experience: Experience) => {
    const isTogglingThis = isToggling === experience.id;
    return (
      <TableRow key={experience.id}>
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
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isTogglingThis}>
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
              <DropdownMenuItem asChild>
                <Link href={`/host/experiences/${experience.id}/edit`} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" /> Edit
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
              <DropdownMenuItem className="text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };
  
  const renderCard = (experience: Experience) => {
      const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
      const isTogglingThis = isToggling === experience.id;

      return (
        <Card key={experience.id}>
            <CardContent className="p-4">
                 <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        {mainImage && <Image src={mainImage.imageUrl} alt={experience.title} fill className="object-cover" sizes="96px" data-ai-hint={mainImage.imageHint} />}
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold leading-tight">{experience.title}</h3>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={isTogglingThis}>
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
                                  <DropdownMenuItem asChild>
                                    <Link href={`/host/experiences/${experience.id}/edit`} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" /> Edit
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
                                  <DropdownMenuItem className="text-destructive cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">${experience.pricing.pricePerGuest} / person</p>
                        <div className="mt-2">
                            <Badge variant={statusVariantMap[experience.status]} className="capitalize">
                                {experience.status}
                            </Badge>
                        </div>
                    </div>
                 </div>
            </CardContent>
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
                {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
                {experiences && experiences.length > 0 ? experiences.map(renderCard) : !isLoading && emptyState}
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {isLoading &&
                        Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={5}>
                            <Skeleton className="h-10 w-full" />
                            </TableCell>
                        </TableRow>
                        ))}
                    {experiences && experiences.length > 0 ? experiences.map(renderRow) : !isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="py-10">
                              {emptyState}
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
