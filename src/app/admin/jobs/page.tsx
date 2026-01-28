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
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Job } from "@/lib/types";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Briefcase } from "lucide-react";
import React, { useState } from "react";
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteJob, createOrUpdateJob } from "@/lib/job-actions";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_UID } from '@/lib/auth';

const jobSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Title is required."),
    department: z.string().min(2, "Department is required."),
    location: z.string().min(2, "Location is required."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    isActive: z.boolean().default(true),
});
type JobFormValues = z.infer<typeof jobSchema>;

function JobForm({ job, onFinished }: { job?: Job, onFinished: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm<JobFormValues>({
        resolver: zodResolver(jobSchema),
        defaultValues: {
            id: job?.id || '',
            title: job?.title || '',
            department: job?.department || '',
            location: job?.location || '',
            description: job?.description || '',
            isActive: job?.isActive ?? true,
        },
    });
    
    async function onSubmit(data: JobFormValues) {
        if (!firestore) return;
        setIsLoading(true);

        try {
            await createOrUpdateJob(firestore, data, job?.id);
            toast({ title: job ? "Job Updated" : "Job Created", description: `Job posting "${data.title}" has been saved.` });
            onFinished();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: error.message || 'An unknown error occurred while saving the job posting.'
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={methods.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Senior Frontend Engineer" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={methods.control} name="department" render={({ field }) => (
                        <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} placeholder="e.g., Engineering" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={methods.control} name="location" render={({ field }) => (
                        <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} placeholder="e.g., Remote (Global)" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={methods.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormDescription>
                            Use HTML for formatting. E.g., &lt;h4&gt;Heading&lt;/h4&gt;, &lt;ul&gt;&lt;li&gt;Point 1&lt;/li&gt;&lt;/ul&gt;.
                        </FormDescription>
                        <FormControl><Textarea rows={15} placeholder="Purpose of Position, Key Tasks, Skills & Expertise , Our Offer" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={methods.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none"><FormLabel>Job is active</FormLabel><FormDescription>Inactive jobs will not be shown on the public careers page.</FormDescription></div>
                    </FormItem>
                )} />
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {job ? 'Save Changes' : 'Create Job'}
                    </Button>
                </DialogFooter>
            </form>
        </FormProvider>
    )
}

export default function AdminJobsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;
  const jobsQuery = useMemoFirebase(() => (firestore && isAdmin) ? collection(firestore, 'jobs') : null, [firestore, isAdmin]);
  const { data: jobs, isLoading } = useCollection<Job>(jobsQuery);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | undefined>(undefined);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const openForm = (job?: Job) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  }

  const handleDelete = async () => {
    if (!jobToDelete || !firestore) return;
    setIsDeleting(true);
    try {
      await deleteJob(firestore, jobToDelete.id);
      toast({ title: "Job Deleted", description: `Job posting "${jobToDelete.title}" has been removed.` });
      setJobToDelete(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-headline font-bold">Job Postings</h1>
            <p className="text-muted-foreground">Manage open positions at Go2Culture.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openForm()}>
                    <PlusCircle className="mr-2"/> Create Job
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                    <DialogDescription>{selectedJob ? `Editing "${selectedJob.title}".` : 'Fill out the details for the new job posting.'}</DialogDescription>
                </DialogHeader>
                <JobForm job={selectedJob} onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>A list of all job postings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))}
              {!isLoading && jobs?.map((job) => (
                <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                        <Badge variant={job.isActive ? 'default' : 'outline'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openForm(job)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setJobToDelete(job)}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!jobs || jobs.length === 0) && (
                 <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No jobs posted yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

       <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job posting for <span className="font-medium">"{jobToDelete?.title}"</span>.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }))}>
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Delete Job
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
