"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, CheckCircle } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  
  profilePhoto: z.any().optional(),
  bio: z.string().min(50, "Please tell us a bit more about yourself (min. 50 characters)."),
  languages: z.string().min(2, "Please list the languages you speak."),

  experienceTitle: z.string().min(5, "Experience title is required."),
  category: z.string({ required_error: "Please select a category." }),
  duration: z.string().min(1, "Duration is required."),
  maxGuests: z.coerce.number().min(1).max(12),
  
  menuDescription: z.string().min(20, "Please describe the menu (min. 20 characters)."),
  cuisineType: z.string().min(3, "Cuisine type is required."),
  dietaryOptions: z.array(z.string()).optional(),
  spiceLevel: z.string({ required_error: "Please select a spice level." }),

  area: z.string().min(3, "Please specify the general area."),
  homeType: z.string({ required_error: "Please select your home type." }),
  hasPets: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),

  photos: z.any().optional(),

  pricePerGuest: z.coerce.number().min(10, "Price must be at least $10."),
  
  agreeToGuidelines: z.boolean().refine(val => val === true, "You must agree to the host guidelines."),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

export default function BecomeAHostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');

  const { toast } = useToast();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasPets: false,
      smokingAllowed: false,
      dietaryOptions: [],
      maxGuests: 4,
      pricePerGuest: 50,
    },
  });

  async function onSubmit(values: OnboardingFormValues) {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmissionState('success');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
      });
      setSubmissionState('error');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (submissionState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="font-headline text-4xl font-bold">Your experience is submitted for review!</h1>
        <p className="mt-4 text-muted-foreground max-w-lg">
          Thank you for joining Go2Culture! Our team will review your submission and get back to you within 3-5 business days. We're excited to have you.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-8">Start a New Application</Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Open your home. Share your culture.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Become a host on Go2Culture and turn your passion for food and culture into unforgettable experiences for travelers.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-12 max-w-4xl mx-auto">
          {/* Section 1: Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>1. Your Basic Information</CardTitle>
              <CardDescription>Let's start with the basics. This will not be public.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
          
          {/* Section 2: Host Profile */}
          <Card>
            <CardHeader>
              <CardTitle>2. Create Your Host Profile</CardTitle>
              <CardDescription>This is what guests will see. Make it personal and welcoming!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem><FormLabel>Your Bio</FormLabel><FormDescription>Tell guests about you, your passions, and your culture.</FormDescription><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="languages" render={({ field }) => (
                <FormItem><FormLabel>Languages Spoken</FormLabel><FormControl><Input {...field} placeholder="e.g., English, Spanish, Italian" /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Section 3: Experience Basics */}
          <Card>
            <CardHeader>
              <CardTitle>3. Your Experience Basics</CardTitle>
              <CardDescription>Give your experience a name and some basic details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="experienceTitle" render={({ field }) => (
                  <FormItem><FormLabel>Experience Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Traditional Kerala Home Feast" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent><SelectItem value="home-cooked-meal">Home-cooked Meal</SelectItem><SelectItem value="cultural-dinner">Cultural Dinner</SelectItem><SelectItem value="cooking-dining">Cooking + Dining</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="duration" render={({ field }) => (
                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input {...field} placeholder="e.g., 3 hours" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="maxGuests" render={({ field }) => (
                    <FormItem><FormLabel>Max Guests</FormLabel><FormControl><Input {...field} type="number" min="1" max="12" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
            </CardContent>
          </Card>

          {/* Section 4: Menu */}
          <Card>
            <CardHeader>
              <CardTitle>4. Menu & Food Details</CardTitle>
              <CardDescription>Describe the delicious food you'll be sharing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="menuDescription" render={({ field }) => (
                <FormItem><FormLabel>Menu Description</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Describe the courses, ingredients, and the story behind the food."/></FormControl><FormMessage /></FormItem>
              )} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="cuisineType" render={({ field }) => (
                    <FormItem><FormLabel>Cuisine Type</FormLabel><FormControl><Input {...field} placeholder="e.g., Italian, Mexican, Japanese" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="spiceLevel" render={({ field }) => (
                    <FormItem><FormLabel>Spice Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select spice level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="mild">Mild</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="spicy">Spicy</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
               </div>
            </CardContent>
          </Card>

           {/* Section 5: Location */}
          <Card>
            <CardHeader>
              <CardTitle>5. Location & Home Setup</CardTitle>
              <CardDescription>Let guests know about your space. Your exact address is never shared until a booking is confirmed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area / Neighborhood</FormLabel><FormControl><Input {...field} placeholder="e.g., Trastevere, Rome" /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="homeType" render={({ field }) => (
                    <FormItem><FormLabel>Home Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select home type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="apartment">Apartment</SelectItem><SelectItem value="house">House</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
               </div>
               <div className="flex items-center space-x-8">
                <FormField control={form.control} name="hasPets" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Do you have pets?</FormLabel></div></FormItem>
                )} />
                <FormField control={form.control} name="smokingAllowed" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Is smoking allowed?</FormLabel></div></FormItem>
                )} />
               </div>
            </CardContent>
          </Card>

          {/* Section 6: Photos */}
           <Card>
            <CardHeader>
              <CardTitle>6. Upload Photos</CardTitle>
              <CardDescription>Real photos perform better than perfect photos. Show off your food and dining area.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="photos" render={({ field }) => (
                  <FormItem><FormLabel>Food & Dining Photos</FormLabel><FormControl><Input type="file" multiple /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Section 7: Pricing & Submission */}
          <Card>
            <CardHeader>
              <CardTitle>7. Pricing & Final Step</CardTitle>
              <CardDescription>Set your price and agree to our guidelines to submit your application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="pricePerGuest" render={({ field }) => (
                  <FormItem><FormLabel>Price per Guest (USD)</FormLabel><FormControl><Input {...field} type="number" min="10" /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField
                  control={form.control}
                  name="agreeToGuidelines"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to the Go2Culture Host Guidelines
                        </FormLabel>
                        <FormDescription>
                          This includes respecting guests, maintaining hygiene, and following all platform rules.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
            </CardContent>
          </Card>


          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting for Review...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
