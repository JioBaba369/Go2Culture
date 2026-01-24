'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Experience } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateExperience } from '@/lib/host-actions';
import Link from 'next/link';

const experienceSchema = z.object({
  title: z.string().min(5, "Experience title is required."),
  description: z.string().min(50, "A compelling description is required (min. 50 characters)."),
  category: z.string({ required_error: "Please select a category." }),
  durationMinutes: z.coerce.number().min(30, "Duration must be at least 30 minutes."),
  menu: z.object({
    cuisine: z.string().min(3, "Cuisine type is required."),
    description: z.string().min(20, "Please describe the menu (min. 20 characters)."),
    dietary: z.array(z.string()).default([]),
    allergens: z.string().optional(),
    spiceLevel: z.string({ required_error: "Please select a spice level." }),
  }),
  pricing: z.object({
    pricePerGuest: z.coerce.number().min(10, "Price must be at least $10."),
    maxGuests: z.coerce.number().min(1).max(20, "Max guests must be between 1 and 20."),
  }),
  availability: z.object({
    days: z.array(z.string()).refine(value => value.some(item => item), {
      message: "You have to select at least one day.",
    }),
    timeSlots: z.string().min(3, "Please enter at least one time slot (e.g., 19:00)."),
  }),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const experienceId = params.id as string;

  const experienceRef = useMemoFirebase(
    () => (firestore && experienceId ? doc(firestore, 'experiences', experienceId) : null),
    [firestore, experienceId]
  );
  const { data: experience, isLoading } = useDoc<Experience>(experienceRef);
  
  const methods = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
  });
  
  useEffect(() => {
    if (experience) {
      methods.reset({
        ...experience,
        // The form expects timeSlots to be a single string, but Firestore might store it as an array.
        availability: {
            ...experience.availability,
            timeSlots: Array.isArray(experience.availability.timeSlots) ? experience.availability.timeSlots.join(', ') : experience.availability.timeSlots || '',
        },
      });
    }
  }, [experience, methods]);

  const onSubmit = async (data: ExperienceFormValues) => {
    if (!firestore) return;
    try {
        const updateData = {
            ...data,
            availability: {
                ...data.availability,
                // Convert the timeSlots string back to an array for Firestore
                timeSlots: data.availability.timeSlots.split(',').map(s => s.trim()).filter(Boolean),
            }
        };
        await updateExperience(firestore, experienceId, updateData);
        toast({
            title: "Experience Updated!",
            description: "Your changes have been saved successfully.",
        });
        router.push('/host/experiences');
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not save your changes.",
        });
    }
  };

  if (isLoading) {
    return <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
    </div>
  }

  if (!experience) {
    return <div>Experience not found.</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-headline font-bold">Edit Experience</h1>
            <div className="flex gap-2">
                <Button variant="outline" asChild><Link href="/host/experiences">Cancel</Link></Button>
                <Button type="submit" disabled={methods.formState.isSubmitting}>
                    {methods.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={methods.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={methods.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4}/></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={methods.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="In-Home Dining">In-Home Dining</SelectItem>
                        <SelectItem value="Cooking Class">Cooking Class</SelectItem>
                        <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                        <SelectItem value="Music & Dance">Music & Dance</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>
                )} />
                 <FormField control={methods.control} name="durationMinutes" render={({ field }) => (
                    <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Menu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={methods.control} name="menu.description" render={({ field }) => (
                    <FormItem><FormLabel>Menu Description</FormLabel><FormControl><Textarea {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={methods.control} name="menu.cuisine" render={({ field }) => (
                        <FormItem><FormLabel>Cuisine</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={methods.control} name="menu.spiceLevel" render={({ field }) => (
                        <FormItem><FormLabel>Spice Level</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="Mild">Mild</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Spicy">Spicy</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>
                    )} />
                </div>
                {/* Add Dietary options if needed */}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                 <FormField control={methods.control} name="pricing.pricePerGuest" render={({ field }) => (
                    <FormItem><FormLabel>Price per Guest ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={methods.control} name="pricing.maxGuests" render={({ field }) => (
                    <FormItem><FormLabel>Maximum Guests</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={methods.control} name="availability.days" render={() => (
                    <FormItem><FormLabel>Available Days</FormLabel><FormDescription>Select the days of the week you're generally available.</FormDescription><div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {weekdays.map(day => (<FormField key={day} control={methods.control} name="availability.days" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl>
                                <Checkbox checked={field.value?.includes(day)} onCheckedChange={checked => {
                                    return checked ? field.onChange([...field.value, day]) : field.onChange(field.value?.filter(value => value !== day))
                                }} />
                            </FormControl><FormLabel className="font-normal">{day}</FormLabel></FormItem>
                        )} />))}
                    </div><FormMessage /></FormItem>
                 )} />
                  <FormField control={methods.control} name="availability.timeSlots" render={({ field }) => (
                    <FormItem><FormLabel>Available Time Slots</FormLabel><FormDescription>Enter comma-separated times (e.g., 18:00, 19:30, 20:00).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>
        
        <div className="flex justify-end">
             <Button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </form>
    </FormProvider>
  );
}
