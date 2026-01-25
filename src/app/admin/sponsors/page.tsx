
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Sponsor } from "@/lib/types";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Globe } from "lucide-react";
import React, { useState } from "react";
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteSponsor } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const sponsorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, "Sponsor name is required."),
    logoUrl: z.string().url("Please enter a valid URL for the logo."),
    website: z.string().url("Please enter a valid URL for the website.").optional().or(z.literal('')),
    isActive: z.boolean().default(true),
});
type SponsorFormValues = z.infer<typeof sponsorSchema>;

function SponsorForm({ sponsor, onFinished }: { sponsor?: Sponsor, onFinished: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm<SponsorFormValues>({
        resolver: zodResolver(sponsorSchema),
        defaultValues: {
            id: sponsor?.id || '',
            name: sponsor?.name || '',
            logoUrl: sponsor?.logoUrl || '',
            website: sponsor?.website || '',
            isActive: sponsor?.isActive ?? true,
        },
    });
    
    const logoUrlValue = methods.watch("logoUrl");

    async function onSubmit(data: SponsorFormValues) {
        if (!firestore) return;
        setIsLoading(true);

        try {
            if (sponsor) {
                // Update existing sponsor
                const sponsorRef = doc(firestore, 'sponsors', sponsor.id);
                await updateDoc(sponsorRef, data);
                toast({ title: "Sponsor Updated", description: `Sponsor "${data.name}" has been saved.` });
            } else {
                // Create new sponsor
                const newSponsorRef = doc(collection(firestore, 'sponsors'));
                await setDoc(newSponsorRef, { 
                    ...data, 
                    id: newSponsorRef.id,
                    createdAt: serverTimestamp() 
                });
                toast({ title: "Sponsor Created", description: `Sponsor "${data.name}" has been added.` });
            }
            onFinished();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: error.message || 'An unknown error occurred while saving the sponsor.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={methods.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Sponsor Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Awesome Company" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={methods.control} name="logoUrl" render={({ field }) => (
                    <FormItem><FormLabel>Logo URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com/logo.png" /></FormControl><FormMessage /></FormItem>
                )} />
                 {logoUrlValue && (
                    <div className="mt-2">
                        <FormLabel>Logo Preview</FormLabel>
                        <div className="mt-2 relative h-24 w-full rounded-md border p-2 flex items-center justify-center">
                            <Image src={logoUrlValue} alt="Logo preview" width={96} height={96} className="object-contain" />
                        </div>
                    </div>
                 )}
                <FormField control={methods.control} name="website" render={({ field }) => (
                    <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input {...field} placeholder="https://example.com" /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={methods.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none"><FormLabel>Sponsor is active</FormLabel><FormDescription>Inactive sponsors will not be shown on the public site.</FormDescription></div>
                    </FormItem>
                )} />
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {sponsor ? 'Save Changes' : 'Create Sponsor'}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    )
}


export default function AdminSponsorsPage() {
  const firestore = useFirestore();
  const sponsorsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'sponsors') : null, [firestore]);
  const { data: sponsors, isLoading } = useCollection<Sponsor>(sponsorsQuery);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | undefined>(undefined);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const openForm = (sponsor?: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsFormOpen(true);
  }

  const handleDelete = async () => {
    if (!sponsorToDelete || !firestore) return;
    setIsDeleting(true);
    try {
      await deleteSponsor(firestore, sponsorToDelete.id);
      toast({ title: "Sponsor Deleted", description: `Sponsor "${sponsorToDelete.name}" has been removed.` });
      setSponsorToDelete(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const emptyState = (
    <div className="text-center py-10">
        <h3 className="text-lg font-semibold">No sponsors added yet.</h3>
        <p className="text-sm text-muted-foreground mt-1">Click the button to add your first sponsor.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">Sponsors</h1>
            <p className="text-muted-foreground">Create and manage your platform's sponsors and partners.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                    <PlusCircle className="mr-2"/> Create Sponsor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{selectedSponsor ? 'Edit Sponsor' : 'Create New Sponsor'}</DialogTitle>
                    <DialogDescription>{selectedSponsor ? `Editing "${selectedSponsor.name}".` : 'Fill out the details for the new sponsor.'}</DialogDescription>
                </DialogHeader>
                <SponsorForm sponsor={selectedSponsor} onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>
      
       {/* Mobile View */}
       <div className="grid gap-4 md:hidden">
            {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
            {!isLoading && sponsors?.map(sponsor => (
                <Card key={sponsor.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Image src={sponsor.logoUrl} alt={sponsor.name} width={64} height={64} className="rounded-md object-contain border p-1" />
                        <div className="flex-grow space-y-1">
                            <h3 className="font-semibold">{sponsor.name}</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant={sponsor.isActive ? 'default' : 'outline'}>{sponsor.isActive ? 'Active' : 'Inactive'}</Badge>
                                {sponsor.website && <Link href={sponsor.website} target="_blank" className="text-xs hover:underline flex items-center gap-1 text-muted-foreground"><Globe className="h-3 w-3" /> Website</Link>}
                            </div>
                        </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openForm(sponsor)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setSponsorToDelete(sponsor)}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardContent>
                </Card>
            ))}
            {!isLoading && (!sponsors || sponsors.length === 0) && (
                <Card className="flex flex-col items-center justify-center p-6">{emptyState}</Card>
            )}
       </div>

      {/* Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
          <CardDescription>A list of all sponsors and partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sponsor</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
              ))}
              {!isLoading && sponsors?.map((sponsor) => (
                <TableRow key={sponsor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Image src={sponsor.logoUrl} alt={sponsor.name} width={40} height={40} className="rounded-sm object-contain" />
                        <span>{sponsor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sponsor.website ? <Link href={sponsor.website} target="_blank" className="hover:underline flex items-center gap-1"><Globe className="h-4 w-4" /> Visit</Link> : 'N/A'}
                    </TableCell>
                    <TableCell>{sponsor.createdAt?.toDate ? format(sponsor.createdAt.toDate(), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant={sponsor.isActive ? 'default' : 'outline'}>{sponsor.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openForm(sponsor)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setSponsorToDelete(sponsor)}>
                            <Trash2 className="mr-2 h-4 w-4"/>Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!sponsors || sponsors.length === 0) && (
                 <TableRow><TableCell colSpan={5}>{emptyState}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <AlertDialog open={!!sponsorToDelete} onOpenChange={(open) => !open && setSponsorToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the sponsor <span className="font-medium">{sponsorToDelete?.name}</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }))}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Delete Sponsor
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
