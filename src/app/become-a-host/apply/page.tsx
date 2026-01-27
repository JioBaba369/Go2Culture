
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, User as UserIcon, LayoutDashboard, Hourglass, Edit, XCircle, HelpCircle } from "lucide-react";
import { useFirestore, useUser, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, getDoc, query, where, limit } from "firebase/firestore";
import type { HostApplication, User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createNotification } from "@/lib/notification-actions";
import { countries, regions, suburbs, localAreas } from "@/lib/location-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  // Step 1: Experience Basics
  category: z.string({ required_error: "Please select an experience category." }),
  experienceTitle: z.string().min(5, "Title must be at least 5 characters."),
  experienceDescription: z.string().min(50, "Please describe the experience (min 50 characters)."),
  durationMinutes: z.coerce.number().min(30, "Duration must be at least 30 minutes."),

  // Step 2: About You
  hostingExperienceLevel: z.enum(['professional', 'passionate'], { required_error: "Please select your experience level." }),
  expertise: z.string().min(20, "Please describe your expertise (min 20 characters)."),
  bio: z.string().min(50, "Please write a short bio (min 50 characters)."),
  
  // Step 3: Location & Home Setup
  hostingLocation: z.string({ required_error: "Please select where you'll host." }),
  country: z.string({ required_error: "Country is required." }),
  region: z.string().optional(),
  suburb: z.string({ required_error: "Suburb/City is required." }),
  localArea: z.string().optional(),
  address: z.string().min(5, "A detailed address is required."),
  postcode: z.string().min(3, "Postcode is required."),
  maxGuests: z.coerce.number().min(1, "Must host at least 1 guest.").max(20, "Cannot host more than 20 guests."),
  accessibility: z.string().optional(),
  
  // Step 4: Menu & Pricing
  menuCuisine: z.string().min(3, "Cuisine is required."),
  menuDescription: z.string().min(20, "Menu description is required."),
  spiceLevel: z.enum(['Mild', 'Medium', 'Spicy'], { required_error: "Please select a spice level." }),
  pricePerGuest: z.coerce.number().min(10, "Price must be at least $10."),
  menu: z.object({
    dietary: z.string().optional(),
  }),

  // Step 5: Media - no fields

  // Step 6: Final Review
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms."),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const steps = [
    { id: 'Step 1', name: 'The Experience' },
    { id: 'Step 2', name: 'Your Story' },
    { id: 'Step 3', name: 'Your Place' },
    { id: 'Step 4', name: 'The Food' },
    { id: 'Step 5', name: 'Photos' },
    { id: 'Step 6', name: 'Final Details' },
];

function HostApplicationStatus({ application }: { application: HostApplication }) {
  let icon, title, description;

  switch (application.status) {
    case 'Pending':
      icon = <Hourglass className="h-16 w-16 text-amber-500 mb-4" />;
      title = "Application Pending Review";
      description = "Our team has received your application and is currently reviewing it. We appreciate your patience and will notify you via email as soon as there's an update. This usually takes 3-5 business days.";
      break;
    case 'Changes Needed':
      icon = <Edit className="h-16 w-16 text-blue-500 mb-4" />;
      title = "Changes Requested";
      description = "Our community team has reviewed your application and requires some changes before it can be approved. Please check your email for detailed feedback and instructions on how to edit your application.";
      break;
    case 'Rejected':
      icon = <XCircle className="h-16 w-16 text-destructive mb-4" />;
      title = "Application Not Approved";
      description = "We appreciate you taking the time to apply. After careful consideration, we are unable to move forward with your application at this time. Thank you for your interest in the Go2Culture community.";
      break;
    default:
      icon = <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />;
      title = "Application Status";
      description = "There is an update regarding your application. Please check your email for more details.";
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      {icon}
      <h1 className="font-headline text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-muted-foreground max-w-2xl">{description}</p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">Back to Homepage</Link>
      </Button>
    </div>
  );
}

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
  
  const hostApplicationsQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'hostApplications'), where('userId', '==', user.uid), limit(1)) : null),
    [firestore, user]
  );
  const { data: hostApplications, isLoading: areAppsLoading } = useCollection<HostApplication>(hostApplicationsQuery);
  const existingApplication = hostApplications?.[0];

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: userProfile?.location?.country || '',
      region: userProfile?.location?.region || '',
      suburb: userProfile?.location?.suburb || '',
      address: '',
      postcode: '',
      accessibility: '',
      bio: '',
      expertise: '',
      experienceTitle: '',
      experienceDescription: '',
      menuCuisine: '',
      menuDescription: '',
      durationMinutes: 120,
      maxGuests: 4,
      pricePerGuest: 50,
      menu: { dietary: '' },
    },
  });

  const { watch, setValue } = methods;
  const watchCountry = watch('country');
  const watchRegion = watch('region');
  const watchSuburb = watch('suburb');

  const availableRegions = regions.filter(s => s.countryId === watchCountry);
  const availableSuburbs = suburbs.filter(s => s.regionId === watchRegion);
  const availableLocalAreas = localAreas.filter(l => l.suburbId === watchSuburb);

  useEffect(() => {
    if (userProfile && !methods.formState.isDirty) {
        methods.reset({
            ...methods.getValues(),
            country: userProfile.location?.country || '',
            region: userProfile.location?.region || '',
            suburb: userProfile.location?.suburb || '',
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, methods.formState.isDirty]);


  useEffect(() => {
    if (watchCountry) {
        setValue('region', '');
        setValue('suburb', '');
        setValue('localArea', '');
    }
  }, [watchCountry, setValue]);

  useEffect(() => {
    if (watchRegion) {
        setValue('suburb', '');
        setValue('localArea', '');
    }
  }, [watchRegion, setValue]);
  
  useEffect(() => {
    if (watchSuburb) {
        setValue('localArea', '');
    }
  }, [watchSuburb, setValue]);

  async function nextStep() {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];
    if (currentStep === 0) fieldsToValidate = ['category', 'experienceTitle', 'experienceDescription', 'durationMinutes'];
    if (currentStep === 1) fieldsToValidate = ['hostingExperienceLevel', 'expertise', 'bio'];
    if (currentStep === 2) fieldsToValidate = ['hostingLocation', 'country', 'suburb', 'address', 'postcode', 'maxGuests'];
    if (currentStep === 3) fieldsToValidate = ['menuCuisine', 'menuDescription', 'spiceLevel', 'pricePerGuest', 'menu.dietary'];
    
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
          bio: values.bio,
          expertise: values.expertise,
          hostingExperienceLevel: values.hostingExperienceLevel,
          hostingStyles: [],
        },
        experience: {
          category: values.category,
          description: values.experienceDescription,
          title: values.experienceTitle,
          durationMinutes: values.durationMinutes,
          menu: { 
            cuisine: values.menuCuisine,
            description: values.menuDescription, 
            spiceLevel: values.spiceLevel,
            dietary: values.menu.dietary ? values.menu.dietary.split(',').map(s => s.trim()).filter(Boolean) : [],
          },
          pricing: { 
            pricePerGuest: values.pricePerGuest,
            maxGuests: values.maxGuests,
          },
          photos: { mainImageId: 'dining-area' },
        },
        homeSetup: {
          homeType: values.hostingLocation,
          seating: 'Table', 
          maxGuests: values.maxGuests,
          pets: false, 
          smoking: false,
          accessibility: values.accessibility,
        },
        location: {
          country: values.country,
          region: values.region || '',
          suburb: values.suburb,
          localArea: values.localArea || '',
          address: values.address,
          postcode: values.postcode,
        },
        verification: { idDocId: "admin-id", selfieId: "admin-selfie", status: 'Pending' },
        compliance: { guidelinesAccepted: values.agreeToTerms },
      };

      const newAppRef = await addDoc(collection(firestore, 'hostApplications'), applicationData as any);
      
      await createNotification(
        firestore,
        user.uid,
        "GENERIC_ALERT",
        newAppRef.id,
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
  
  const isLoading = isUserLoading || isProfileLoading || areAppsLoading;

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

  if (existingApplication && userProfile && userProfile.role === 'guest') {
    return <HostApplicationStatus application={existingApplication} />;
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
        <h1 className="font-headline text-4xl font-bold">Congratulations! Your story is on its way to us.</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Our community team will carefully read your application and be in touch via email soon.
        </p>
        <Card className="mt-8 text-left max-w-md">
            <CardHeader>
                <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>We Read Your Story:</strong> Our team personally reviews every application.</p>
                <p><strong>You're Approved:</strong> You'll get a formal welcome and access to your Host Dashboard.</p>
                <p><strong>Refine Your Listing:</strong> Add photos and fine-tune the details of your experience.</p>
                <p><strong>Go Live:</strong> Open up your calendar and get ready to welcome your first guests!</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Share Your Story</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We're excited to hear your story. Just follow these {steps.length} steps to start your journey as a host.
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
                    <CardHeader><CardTitle>1. The Experience</CardTitle><CardDescription>Tell us about the experience you want to create.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                         <FormField control={methods.control} name="category" render={({ field }) => (
                            <FormItem><FormLabel>What kind of experience are you creating?</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category..."/></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="In-Home Dining">In-Home Dining</SelectItem>
                                <SelectItem value="Cooking Class">Cooking Class</SelectItem>
                                <SelectItem value="Special Event">Special Event</SelectItem>
                                <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                                <SelectItem value="Music & Dance">Music & Dance</SelectItem>
                                <SelectItem value="History & Walks">History & Walks</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="experienceTitle" render={({ field }) => (
                            <FormItem><FormLabel>What's the name of your experience?</FormLabel><FormControl><Input placeholder="e.g., Authentic Pasta Making with Nonna's Recipes" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="experienceDescription" render={({ field }) => (
                            <FormItem><FormLabel>Tell us about your experience</FormLabel><FormDescription>What should guests expect? What is the atmosphere? Why is it special?</FormDescription><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="durationMinutes" render={({ field }) => (
                            <FormItem><FormLabel>How long will it run for (in minutes)?</FormLabel><FormControl><Input type="number" placeholder="e.g., 180" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}

            {currentStep === 1 && (
                 <Card>
                    <CardHeader><CardTitle>2. Your Story</CardTitle><CardDescription>Help guests get to know their future host.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={methods.control} name="hostingExperienceLevel" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>How would you describe yourself?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="passionate" /></FormControl><FormLabel className="font-normal">I'm a passionate home cook with a story to tell</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="professional" /></FormControl><FormLabel className="font-normal">I'm a professional chef with culinary training</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="expertise" render={({ field }) => (
                            <FormItem><FormLabel>Tell us about your background and what makes your cooking special</FormLabel><FormDescription>E.g., "I learned to cook from my grandmother in Naples...", "I trained at Le Cordon Bleu...", "I've been hosting pop-up dinners for 5 years..."</FormDescription><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={methods.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Your Story</FormLabel><FormDescription>Help guests get to know you. What's your story? What drives your passion for your culture?</FormDescription><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader><CardTitle>3. Your Place</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={methods.control} name="hostingLocation" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Where will the experience take place?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="My home" /></FormControl><FormLabel className="font-normal">At my place</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Event space" /></FormControl><FormLabel className="font-normal">In a rented space</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Somewhere else</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={methods.control} name="country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={methods.control} name="region" render={({ field }) => (
                                <FormItem><FormLabel>{watchCountry === 'NZ' ? 'Region' : 'State'}</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!availableRegions.length}><FormControl><SelectTrigger><SelectValue placeholder={watchCountry === 'NZ' ? 'Select your region' : 'Select your state'} /></SelectTrigger></FormControl><SelectContent>{availableRegions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={methods.control} name="suburb" render={({ field }) => (
                                <FormItem><FormLabel>Suburb/City</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!availableSuburbs.length}><FormControl><SelectTrigger><SelectValue placeholder="Select your suburb/city" /></SelectTrigger></FormControl><SelectContent>{availableSuburbs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={methods.control} name="localArea" render={({ field }) => (
                                <FormItem><FormLabel>Local Area</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!availableLocalAreas.length}><FormControl><SelectTrigger><SelectValue placeholder="Select your local area" /></SelectTrigger></FormControl><SelectContent>{availableLocalAreas.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={methods.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Your street address</FormLabel><FormDescription>Don't worry, we'll only share the exact address after a booking is confirmed.</FormDescription><FormControl><Input placeholder="e.g., 123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={methods.control} name="postcode" render={({ field }) => (
                            <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={methods.control} name="maxGuests" render={({ field }) => (
                            <FormItem><FormLabel>How many guests can you welcome?</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="accessibility" render={({ field }) => (
                            <FormItem><FormLabel>Anything to know about accessibility?</FormLabel><FormDescription>e.g., "Ground floor access", "Two steps to enter", "Elevator in building"</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}

             {currentStep === 3 && (
                <Card>
                    <CardHeader><CardTitle>4. The Food</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={methods.control} name="menuCuisine" render={({ field }) => (
                            <FormItem><FormLabel>What type of cuisine will you be sharing?</FormLabel><FormControl><Input placeholder="e.g., Italian, Thai, Lebanese" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="menuDescription" render={({ field }) => (
                            <FormItem><FormLabel>Tell us about the delicious food you'll be serving.</FormLabel><FormDescription>What will you be serving your guests?</FormDescription><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="spiceLevel" render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>How spicy is the food?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Mild" /></FormControl><FormLabel className="font-normal">Mild</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Medium" /></FormControl><FormLabel className="font-normal">Medium</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Spicy" /></FormControl><FormLabel className="font-normal">Spicy</FormLabel></FormItem>
                            </RadioGroup></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="menu.dietary" render={({ field }) => (
                            <FormItem><FormLabel>Dietary Options</FormLabel><FormDescription>List any dietary accommodations, separated by commas (e.g., Vegetarian, Gluten-Free).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={methods.control} name="pricePerGuest" render={({ field }) => (
                            <FormItem><FormLabel>Your price per guest (AUD)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            )}

            {currentStep === 4 && (
                 <Card>
                    <CardHeader><CardTitle>5. Photos</CardTitle><CardDescription>To build a community on trust, great photos help guests feel comfortable and excited.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">We'll use some placeholder images for now. Once your application is approved, you can upload your own beautiful photos.</p>
                        <FormItem><FormLabel>Profile Picture</FormLabel><FormControl><Input type="file" disabled /></FormControl></FormItem>
                        <FormItem><FormLabel>Gallery (add a minimum of 4 photos)</FormLabel><FormControl><Input type="file" multiple disabled /></FormControl><FormDescription>Tip: High-quality photos of the location, dishes, and people enjoying themselves are key to attracting guests.</FormDescription></FormItem>
                    </CardContent>
                </Card>
            )}

            {currentStep === 5 && (
                <Card>
                    <CardHeader><CardTitle>6. Final Details</CardTitle><CardDescription>Just a few final details before you submit your application.</CardDescription></CardHeader>
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
                        {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>) : "Send My Application"}
                    </Button>
                )}
            </div>
        </form>
      </FormProvider>
    </div>
  );
}
