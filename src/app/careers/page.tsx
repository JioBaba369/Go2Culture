'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, MapPin, Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Job } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, React.ElementType> = {
    Engineering: Code,
    Marketing: Briefcase,
    Operations: Briefcase,
    Default: Briefcase,
};

const applicationSchema = z.object({
    name: z.string().min(2, "Please enter your name."),
    email: z.string().email("Please enter a valid email address."),
    coverLetter: z.string().min(50, "Please write a cover letter of at least 50 characters."),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

function ApplicationForm({ job, onFinished }: { job: Job, onFinished: () => void }) {
    const { toast } = useToast();
    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationSchema),
        defaultValues: { name: '', email: '', coverLetter: '' },
    });

    function onSubmit(values: ApplicationFormValues) {
        // In a real application, this would submit the data to a backend service.
        console.log("Application Submitted:", { ...values, jobTitle: job.title });
        toast({
            title: "Application Sent!",
            description: `Your application for ${job.title} has been submitted.`,
        });
        onFinished();
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="coverLetter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl><Textarea rows={5} placeholder="Tell us why you'd be a great fit for this role and for Go2Culture..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  Submit Application
                </Button>
            </form>
        </Form>
    );
}

export default function CareersPage() {
    const firestore = useFirestore();
    const jobsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'jobs'), where('isActive', '==', true)) : null,
        [firestore]
    );
    const { data: openPositions, isLoading } = useCollection<Job>(jobsQuery);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Join Our Team</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Help us on our mission to connect the world through food and culture. We're a passionate, remote-first team looking for talented people to help us build something special.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="font-headline text-3xl font-bold">Current Openings</h2>
                <div className="mt-6">
                    {isLoading && (
                        <div className="space-y-4">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    )}
                    {!isLoading && openPositions && openPositions.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {openPositions.map((position) => {
                                const Icon = iconMap[position.department] || iconMap.Default;
                                return (
                                    <AccordionItem value={position.id} key={position.id} asChild>
                                        <Card>
                                             <div className="flex items-center w-full p-6">
                                                <AccordionTrigger className="flex-grow p-0 text-left hover:no-underline justify-start">
                                                    <div className="flex-grow text-left">
                                                        <h3 className="text-xl font-semibold">{position.title}</h3>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {position.department}</span>
                                                            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {position.location}</span>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <Dialog open={selectedJob?.id === position.id} onOpenChange={(isOpen) => !isOpen && setSelectedJob(null)}>
                                                    <DialogTrigger asChild>
                                                        <Button className="ml-4 shrink-0" onClick={() => setSelectedJob(position)}>
                                                            Apply Now
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Apply for {position.title}</DialogTitle>
                                                            <DialogDescription>
                                                                Submit your application to Go2Culture. We're excited to hear from you.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <ApplicationForm job={position} onFinished={() => setSelectedJob(null)} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <AccordionContent>
                                                <div className="px-6 pb-6 prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                                                    {position.description}
                                                </div>
                                            </AccordionContent>
                                        </Card>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    ) : (
                        !isLoading && (
                            <Card className="text-center py-12">
                                <p className="text-muted-foreground">There are no open positions at this time. Please check back later!</p>
                            </Card>
                        )
                    )}
                </div>
                 <div className="text-center mt-12 bg-card p-8 rounded-lg">
                    <h3 className="font-headline text-2xl font-bold">Don't See the Right Fit?</h3>
                    <p className="mt-2 text-muted-foreground">We're always looking for talented, passionate people. Send us your resume and tell us how you could make a difference at Go2Culture.</p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/contact?subject=General Application">Contact Us</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
