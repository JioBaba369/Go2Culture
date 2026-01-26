
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, getDoc } from "firebase/firestore";
import type { HostApplication, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { createNotification } from "@/lib/notification-actions";


const wowFactorOptions = [
    { id: 'rooftop', label: 'Rooftop' },
    { id: 'view', label: 'View' },
    { id: 'terrace', label: 'Terrace' },
    { id: 'garden', label: 'Garden' },
    { id: 'fine-dining', label: 'Fine-dining' },
    { id: 'historical-monument', label: 'Historical monument' },
    { id: 'live-music', label: 'Live music' },
    { id: 'unique-setting', label: 'Unique setting' },
    { id: 'other-wow', label: 'Other' },
] as const;

const formSchema = z.object({
  // Step 1
  experienceType: z.string({ required_error: "Please select an experience type." }),
  experienceDescription: z.string().min(50, "Please describe the experience (min 50 characters)."),
  availability: z.enum(['weekdays', 'weekends', 'not-sure'], { required_error: "Please select your availability." }),
  
  // Step 2
  hostingLocation: z.string({ required_error: "Please select where you'll host." }),
  wowFactors: z.array(z.string()).optional(),
  spaceDescription: z.string().optional(),

  // Step 4
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms."),
});


type OnboardingFormValues = z.infer<typeof formSchema>;

const steps = [
    { id: 'Step 1', name: 'Experience Type & Description' },
    { id: 'Step 2', name: 'Location & Atmosphere' },
    { id: 'Step 3', name: 'Media Upload' },
    { id: 'Step 4', name: 'Final Review & Terms' },
];

export default function BecomeAHostPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, "users", user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wowFactors: [],
    },
  });

  async function nextStep() {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['experienceType', 'experienceDescription', 'availability'];
    }
    if (currentStep === 1) {
        fieldsToValidate = ['hostingLocation'];
    }
    
    const output = await methods.trigger(fieldsToValidate);
    
    if (!output) {
      toast({
        variant: "destructive",
        title: "Please fill out all required fields",
        description: "Check the form for any error messages.",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
      window.scrollTo(0, 0);
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1);
      window.scrollTo(0, 0);
    }
  }
  
  async function onSubmit(values: OnboardingFormValues) {
    if (!firestore || !user || !user.displayName) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to submit an application." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const userDoc = userDocRef ? await getDoc(userDocRef) : null;
      const userData = userDoc?.data();

      const applicationData: Partial<HostApplication> = {
        userId: user.uid,
        hostName: user.displayName,
        status: 'Pending',
        submittedDate: serverTimestamp(),
        riskFlag: null,
        profile: {
          profilePhotoId: userData?.profilePhotoId || "guest-1",
          bio: 'To be completed by host.',
          expertise: 'To be completed by host.',
          hostingExperienceLevel: 'passionate',
          hostingStyles: [],
          availabilityPreference: values.availability,
        },
        experience: {
          category: values.experienceType,
          description: values.experienceDescription,
          title: `New Experience by ${user.displayName}`,
          durationMinutes: 120,
          menu: { cuisine: 'TBD', description: 'TBD', spiceLevel: 'Mild' },
          pricing: { pricePerGuest: 50, maxGuests: 4 },
          photos: { mainImageId: 'dining-area' },
        },
        homeSetup: {
          homeType: values.hostingLocation,
          wowFactors: values.wowFactors,
          spaceDescription: values.spaceDescription,
          seating: 'Table', maxGuests: 4, pets: false, smoking: false,
        },
        location: {
          country: userData?.location?.country || 'TBD',
          region: userData?.location?.region || '',
          suburb: userData?.location?.suburb || 'TBD',
          address: userData?.location?.address || 'TBD',
          postcode: userData?.location?.postcode || 'TBD',
        },
        verification: { idDocId: "admin-id", selfieId: "admin-selfie", status: 'Pending' },
        compliance: { guidelinesAccepted: values.agreeToTerms },
      };

      await addDoc(collection(firestore, 'hostApplications'), applicationData);
      
      // Create notification
      await createNotification(
        firestore,
        user.uid,
        "We received your application and we can’t wait to review it!",
        "/host" // Link to host dashboard
      );

      setSubmissionState('success');

    } catch (error) {
      console.error("Application submission error:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "An unexpected error occurred. Please try again." });
      setSubmissionState('error');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-headline text-4xl font-bold">Please Log In</h1>
        <p className="mt-4 text-muted-foreground max-w-lg">
          You need to be logged into a Go2Culture account before you can apply to become a host.
        </p>
        <div className="flex gap-4 mt-8">
          <Button asChild><Link href="/login">Log In</Link></Button>
          <Button asChild variant="secondary"><Link href="/signup">Create Account</Link></Button>
        </div>
      </div>
    );
  }

  if (userProfile && (userProfile.role === 'host' || userProfile.role === 'both')) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <LayoutDashboard className="h-16 w-16 text-primary mb-4" />
        <h1 className="font-headline text-4xl font-bold">You're already a host!</h1>
        <p className="mt-4 text-muted-foreground max-w-lg">
          Thanks for being part of our community. You can manage your experiences, bookings, and profile from your Host Dashboard.
        </p>
        <Button asChild className="mt-8">
          <Link href="/host">Go to Host Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (submissionState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="font-headline text-4xl font-bold">Congratulations! Your application has been sent!</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Our Community Team will review your application and keep you updated via email.
        </p>
        <Card className="mt-8 text-left max-w-md">
            <CardHeader>
                <CardTitle>What's next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Wait for Approval:</strong> Our team reviews every application for quality.</p>
                <p><strong>Get the Green Light:</strong> Receive a formal welcome and dashboard access.</p>
                <p><strong>Create Your Experience:</strong> Build your profile and describe your unique culture.</p>
                <p><strong>Go Live:</strong> Update your calendar and start hosting!</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Application</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Join our community of hosts by completing the {steps.length} steps below.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 mt-12 max-w-4xl mx-auto">
            
            <div className="px-4 py-2 space-y-4">
                <Progress value={((currentStep + 1) / steps.length) * 100} />
                <p className="text-center text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
            </div>

            {currentStep === 0 && (
                <Card>
                    <CardHeader><CardTitle>1. Experience Type & Description</CardTitle><CardDescription>What type of experience will you host first?</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={methods.control} name="experienceType" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>What type of experiences would you like to host?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Dinner" /></FormControl><FormLabel className="font-normal">Dinner</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Cooking Class" /></FormControl><FormLabel className="font-normal">Cooking class</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="History & Walks" /></FormControl><FormLabel className="font-normal">Food tour</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="experienceDescription" render={({ field }) => (
                            <FormItem><FormLabel>Describe the first experience you would like to host</FormLabel><FormDescription>E.g., for a dinner, what should guests expect? What is the atmosphere? How many courses? Why is the setting special?</FormDescription><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="availability" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>How often are you available to host?</FormLabel><FormDescription>Don't worry, you will have full control over your availability!</FormDescription><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="weekdays" /></FormControl><FormLabel className="font-normal">Weekdays</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="weekends" /></FormControl><FormLabel className="font-normal">Weekends</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="not-sure" /></FormControl><FormLabel className="font-normal">I don't know yet</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}
            {currentStep === 1 && (
                <Card>
                    <CardHeader><CardTitle>2. Location & Atmosphere</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={methods.control} name="hostingLocation" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Where will you host?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="My home" /></FormControl><FormLabel className="font-normal">My home</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Event space" /></FormControl><FormLabel className="font-normal">Event space</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="wowFactors" render={() => (
                            <FormItem><div className="mb-4"><FormLabel className="text-base">🤩 The WOW Factor</FormLabel><FormDescription>Select all that apply.</FormDescription></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{wowFactorOptions.map((item) => (
                                <FormField key={item.id} control={methods.control} name="wowFactors" render={({ field }) => (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl><Checkbox checked={field.value?.includes(item.label)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...(field.value || []), item.label]) : field.onChange(field.value?.filter((value) => value !== item.label))
                                    }} /></FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                                )}/>
                            ))}</div><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="spaceDescription" render={({ field }) => (
                            <FormItem><FormLabel>Anything we should know about your space or neighborhood?</FormLabel><FormDescription>Example: "I will host in a classic Roman apartment with vintage furniture and an impressive vinyl collection."</FormDescription><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}
            {currentStep === 2 && (
                 <Card>
                    <CardHeader><CardTitle>3. Media Upload (The "Trust" Step)</CardTitle><CardDescription>Time to show off! To build a trusted community, ensuring guests feel safe starts with your photos.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">For now, we'll use placeholders. You'll be able to upload your own photos after your application is approved.</p>
                        <FormItem><FormLabel>Profile Picture</FormLabel><FormControl><Input type="file" disabled /></FormControl></FormItem>
                        <FormItem><FormLabel>Gallery (add a minimum of 4 photos)</FormLabel><FormControl><Input type="file" multiple disabled /></FormControl><FormDescription>Tip: High-quality photos of the location, dishes, and people enjoying themselves are key to attracting guests.</FormDescription></FormItem>
                        <FormItem><FormLabel>Video (Optional)</FormLabel><FormControl><Input type="file" disabled /></FormControl><FormDescription>Show our team your place and give us a wave!</FormDescription></FormItem>
                    </CardContent>
                </Card>
            )}
            {currentStep === 3 && (
                <Card>
                    <CardHeader><CardTitle>4. Final Review & Terms</CardTitle><CardDescription>Please review our terms and conditions before submitting.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                            <li><strong>Respect My Guests:</strong> I pledge to show no bias and foster an inclusive environment.</li>
                            <li><strong>Safety First:</strong> I will put guests' care and safety as my number one priority.</li>
                            <li><strong>Responsiveness:</strong> I will keep my calendar updated and respond quickly.</li>
                            <li><strong>Price Parity:</strong> If offered elsewhere, I pledge pricing equivalence on Go2Culture.</li>
                            <li><strong>Accuracy:</strong> I promise to offer the exact experience the guests booked.</li>
                            <li><strong>Communication:</strong> I will communicate only through the Go2Culture platform to protect my host privileges.</li>
                        </ul>
                        <FormField control={methods.control} name="agreeToTerms" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>I agree to the Go2Culture <Link href="/terms" className="underline hover:text-primary">terms and conditions</Link>.</FormLabel>
                            </div>
                            </FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}


            <div className="flex gap-4 justify-end">
                {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                    </Button>
                )}
                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                        Next
                    </Button>
                ) : (
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : "Submit Application"}
                    </Button>
                )}
            </div>
        </form>
      </FormProvider>
    </div>
  );
}
