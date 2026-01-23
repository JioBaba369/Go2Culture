
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
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
import { Loader2, PartyPopper, User as UserIcon } from "lucide-react";
import { countries, regions } from "@/lib/location-data";
import { complianceRequirementsByState, countryComplianceRequirements, type ComplianceRequirement } from "@/lib/compliance-data";
import { useFirestore, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { HostApplication } from "@/lib/types";

const hostingStyleOptions = [
  { id: 'family-style', label: 'Family-style' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'quiet-traditional', label: 'Quiet & traditional' },
  { id: 'festive-social', label: 'Festive & social' },
] as const;

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Invalid email address."),
  
  profile: z.object({
    profilePhoto: z.any().optional(),
    bio: z.string().min(50, "Please tell us a bit more about yourself (min. 50 characters)."),
    languages: z.string().min(2, "Please list the languages you speak."),
    culturalBackground: z.string().min(2, "What is your cultural background?"),
    hostingStyles: z.array(z.string()).refine(value => value.some(item => item), {
      message: "You have to select at least one hosting style.",
    }),
  }),
  
  experience: z.object({
    title: z.string().min(5, "Experience title is required."),
    category: z.string({ required_error: "Please select a category." }),
    durationMinutes: z.coerce.number().min(30, "Duration must be at least 30 minutes."),
    menu: z.object({
      description: z.string().min(20, "Please describe the menu (min. 20 characters)."),
      cuisine: z.string().min(3, "Cuisine type is required."),
      allergens: z.string().optional(),
      spiceLevel: z.string({ required_error: "Please select a spice level." }),
    }),
    photos: z.object({
      foodPhotos: z.any().optional(),
      diningAreaPhoto: z.any().optional(),
    }),
    pricing: z.object({
      pricePerGuest: z.coerce.number().min(10, "Price must be at least $10."),
    }),
  }),

  location: z.object({
    country: z.string({ required_error: "Please select your country." }),
    region: z.string().optional(),
    address: z.string().min(5, "Your full address is required."),
    postcode: z.string().min(3, "Postcode is required."),
  }),

  homeSetup: z.object({
    homeType: z.string({ required_error: "Please select your home type." }),
    seating: z.string({ required_error: "Please select your seating type." }),
    maxGuests: z.coerce.number().min(1).max(20, "Maximum of 20 guests allowed."),
    pets: z.boolean().default(false),
    smoking: z.boolean().default(false),
    accessibility: z.string().optional(),
  }),
  
  compliance: z.object({
    foodBusinessRegistered: z.boolean().optional(),
    councilName: z.string().optional(),
    foodSafetyTrainingCompleted: z.boolean().optional(),
    foodActClassification: z.boolean().optional(),
    foodTraderRegistered: z.boolean().optional(),
    foodBusinessLicense: z.boolean().optional(),
    foodSafetySupervisor: z.boolean().optional(),
    foodBusinessNotification: z.boolean().optional(),
    guidelinesAccepted: z.boolean().refine(val => val === true, "You must agree to the host guidelines."),
    agreeToFoodSafety: z.boolean().refine(val => val === true, "You must agree to the food safety responsibilities."),
  }),

}).superRefine((data, ctx) => {
  // Common state/region validation for AU and NZ
  if ((data.location.country === 'AU' || data.location.country === 'NZ') && !data.location.region) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'State/Region is required for hosts in Australia and New Zealand.',
      path: ['location', 'region'],
    });
  }

  // Australia-specific state-level compliance
  if (data.location.country === 'AU' && data.location.region) {
    const stateCompliance = complianceRequirementsByState[data.location.region];
    if (stateCompliance) {
      stateCompliance.requirements.forEach(req => {
        const complianceData = data.compliance as Record<string, any>;
        if (req.required && !complianceData[req.id]) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required.", path: ['compliance', req.id] });
        }
        if (req.condition && complianceData[req.condition] && !complianceData[req.id]) {
           ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Please provide details.`, path: ['compliance', req.id] });
        }
      });
    }
  }

  // New Zealand-specific country-level compliance
  if (data.location.country === 'NZ') {
    const countryCompliance = countryComplianceRequirements['NZ'];
    if (countryCompliance) {
        countryCompliance.requirements.forEach(req => {
            const complianceData = data.compliance as Record<string, any>;
            if (req.required && !complianceData[req.id]) {
                 ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This field is required.", path: ['compliance', req.id] });
            }
             if (req.condition && complianceData[req.condition] && !complianceData[req.id]) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Please provide details.`, path: ['compliance', req.id] });
            }
        });
    }
  }
});

type OnboardingFormValues = z.infer<typeof formSchema>;

const ComplianceField = ({ control, requirement }: { control: any, requirement: ComplianceRequirement }) => {
  const watchCondition = requirement.condition ? useForm<OnboardingFormValues>().watch(`compliance.${requirement.condition}` as any) : true;
  if (!watchCondition) return null;

  return (
    <FormField
      control={control}
      name={`compliance.${requirement.id}` as any}
      render={({ field }) => (
        <FormItem>
          {requirement.type === 'checkbox' ? (
             <div className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{requirement.label}</FormLabel>
                {requirement.description && <FormDescription>{requirement.description}</FormDescription>}
              </div>
            </div>
          ) : (
            <>
              <FormLabel>{requirement.label}</FormLabel>
              {requirement.description && <FormDescription>{requirement.description}</FormDescription>}
              <FormControl><Input {...field} placeholder={requirement.description} value={field.value || ''} /></FormControl>
            </>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function BecomeAHostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      homeSetup: {
        pets: false,
        smoking: false,
        maxGuests: 4,
      },
      experience: {
        pricing: {
          pricePerGuest: 50,
        },
      },
      profile: {
        hostingStyles: [],
      },
      compliance: {
        guidelinesAccepted: false,
        agreeToFoodSafety: false
      }
    },
  });
  
  const watchCountry = form.watch('location.country');
  const watchRegion = form.watch('location.region');
  
  const availableRegions = regions.filter(s => s.countryId === watchCountry);
  const stateCompliance = watchCountry === 'AU' && watchRegion ? complianceRequirementsByState[watchRegion] : null;
  const countryCompliance = watchCountry ? countryComplianceRequirements[watchCountry] : null;

  async function onSubmit(values: OnboardingFormValues) {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit an application.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const {
        profile: { profilePhoto, ...profileData },
        experience: { photos, ...experienceData },
        ...restOfValues
      } = values;

      const applicationData: Omit<HostApplication, 'id'> = {
        ...restOfValues,
        userId: user.uid,
        hostName: values.fullName,
        profile: {
          ...profileData,
          photoId: 'guest-1', // Placeholder
        },
        experience: {
          ...experienceData,
          // We are not handling file uploads yet, so use placeholders
          photos: {
            mainImageId: 'dining-area',
          }
        },
        verification: {
          idDocId: 'admin-id', // Placeholder
          selfieId: 'admin-selfie', // Placeholder
          status: 'Pending',
        },
        status: 'Pending',
        submittedDate: serverTimestamp(),
        riskFlag: null,
      };

      await addDoc(collection(firestore, 'hostApplications'), applicationData);
      setSubmissionState('success');

    } catch (error) {
      console.error("Application submission error:", error);
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
  
  if (isUserLoading) {
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
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (submissionState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <PartyPopper className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="font-headline text-4xl font-bold">Your experience is submitted for review!</h1>
        <p className="mt-4 text-muted-foreground max-w-lg">
          Thank you for joining Go2Culture! Our team will review your submission and get back to you within 3-5 business days. We're excited to have you.
        </p>
        <Button asChild className="mt-8">
          <Link href="/become-a-host">Back to Host Information</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Application</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Fill out the form below to share your culture with the world.
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
               <FormField control={form.control} name="profile.profilePhoto" render={({ field }) => (
                  <FormItem><FormLabel>Profile Photo</FormLabel><FormDescription>You can upload a real photo later. We'll use a placeholder for now.</FormDescription><FormControl><Input type="file" disabled/></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="profile.bio" render={({ field }) => (
                <FormItem><FormLabel>Your Bio</FormLabel><FormDescription>Tell guests about you, your passions, and your culture.</FormDescription><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="profile.culturalBackground" render={({ field }) => (
                <FormItem><FormLabel>Cultural Background</FormLabel><FormDescription>E.g., "Italian-Australian", "Cantonese", "Nigerian", "Māori"</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="profile.languages" render={({ field }) => (
                <FormItem><FormLabel>Languages Spoken</FormLabel><FormControl><Input {...field} placeholder="e.g., English, Spanish, Italian" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField
                control={form.control}
                name="profile.hostingStyles"
                render={() => (
                  <FormItem>
                    <FormLabel>Hosting Style</FormLabel>
                    <FormDescription>How do you like to host?</FormDescription>
                    <div className="grid grid-cols-2 gap-4">
                      {hostingStyleOptions.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="profile.hostingStyles"
                          render={({ field }) => (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.label)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.label])
                                      : field.onChange(field.value?.filter((value) => value !== item.label));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 3: Experience Basics */}
          <Card>
            <CardHeader>
              <CardTitle>3. Your Experience Basics</CardTitle>
              <CardDescription>Give your experience a name and some basic details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="experience.title" render={({ field }) => (
                  <FormItem><FormLabel>Experience Title</FormLabel><FormControl><Input {...field} placeholder="e.g., Traditional Kerala Home Feast" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="experience.category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl><SelectContent>
                      <SelectItem value="In-Home Dining">In-Home Dining</SelectItem>
                      <SelectItem value="Cooking Class">Cooking Class</SelectItem>
                      <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                      <SelectItem value="Music & Dance">Music & Dance</SelectItem>
                      <SelectItem value="History & Walks">History & Walks</SelectItem>
                      <SelectItem value="Restaurant Experience">Restaurant Experience</SelectItem>
                      <SelectItem value="Special Event">Special Event</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="experience.durationMinutes" render={({ field }) => (
                    <FormItem><FormLabel>Duration (in minutes)</FormLabel><FormControl><Input {...field} type="number" placeholder="e.g., 180" /></FormControl><FormMessage /></FormItem>
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
              <FormField control={form.control} name="experience.menu.description" render={({ field }) => (
                <FormItem><FormLabel>Menu Description</FormLabel><FormControl><Textarea {...field} rows={4} placeholder="Describe the courses, ingredients, and the story behind the food."/></FormControl><FormMessage /></FormItem>
              )} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="experience.menu.cuisine" render={({ field }) => (
                    <FormItem><FormLabel>Cuisine Type</FormLabel><FormControl><Input {...field} placeholder="e.g., Italian, Mexican, Japanese" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="experience.menu.spiceLevel" render={({ field }) => (
                    <FormItem><FormLabel>Spice Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select spice level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Mild">Mild</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Spicy">Spicy</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
               </div>
               <FormField control={form.control} name="experience.menu.allergens" render={({ field }) => (
                  <FormItem><FormLabel>Allergens</FormLabel><FormDescription>List any potential allergens present in your kitchen (e.g., nuts, shellfish, dairy).</FormDescription><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </CardContent>
          </Card>

           {/* Section 5: Location */}
          <Card>
            <CardHeader>
              <CardTitle>5. Location & Home Setup</CardTitle>
              <CardDescription>Your exact address is never shared until a booking is confirmed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="location.country" render={({ field }) => (
                        <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger></FormControl><SelectContent>{countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location.region" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{watchCountry === 'NZ' ? 'Region' : 'State'}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!availableRegions.length}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={watchCountry === 'NZ' ? 'Select your region' : 'Select your state'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>{availableRegions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )} />
                </div>
               <FormField control={form.control} name="location.address" render={({ field }) => (
                <FormItem><FormLabel>Full Address</FormLabel><FormControl><Input {...field} placeholder="123 Main Street, Sydney" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location.postcode" render={({ field }) => (
                <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} placeholder="2000" /></FormControl><FormMessage /></FormItem>
              )} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField control={form.control} name="homeSetup.homeType" render={({ field }) => (
                    <FormItem><FormLabel>Home Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select home type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Apartment">Apartment</SelectItem><SelectItem value="House">House</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="homeSetup.seating" render={({ field }) => (
                    <FormItem><FormLabel>Seating Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select seating type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Table">Table</SelectItem><SelectItem value="Floor">Floor</SelectItem><SelectItem value="Mixed">Mixed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
               </div>
                <FormField control={form.control} name="homeSetup.maxGuests" render={({ field }) => (
                    <FormItem><FormLabel>Max Guests</FormLabel><FormControl><Input {...field} type="number" min="1" max="20" /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={form.control} name="homeSetup.accessibility" render={({ field }) => (
                  <FormItem><FormLabel>Accessibility Notes</FormLabel><FormDescription>E.g., "There are 3 steps to enter", "Elevator access available".</FormDescription><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                )} />
               <div className="flex items-center space-x-8 pt-2">
                <FormField control={form.control} name="homeSetup.pets" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I have pets</FormLabel></div></FormItem>
                )} />
                <FormField control={form.control} name="homeSetup.smoking" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Smoking is allowed</FormLabel></div></FormItem>
                )} />
               </div>
            </CardContent>
          </Card>

          {/* Section 6: Photos */}
           <Card>
            <CardHeader>
              <CardTitle>6. Upload Photos</CardTitle>
              <CardDescription>Real photos perform better. We'll use placeholders for now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="experience.photos.foodPhotos" render={({ field }) => (
                  <FormItem><FormLabel>Food Photos (select up to 5)</FormLabel><FormControl><Input type="file" multiple disabled /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="experience.photos.diningAreaPhoto" render={({ field }) => (
                  <FormItem><FormLabel>Dining Area Photo</FormLabel><FormControl><Input type="file" disabled /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {/* Section 7: Legal & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>7. Legal & Compliance</CardTitle>
              <CardDescription>Please confirm the following for compliance with local regulations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!watchCountry && <p className="text-muted-foreground">Please select your country in the Location section to see relevant compliance requirements.</p>}
                
                {countryCompliance && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Requirements for {countryCompliance.name}</h3>
                    {countryCompliance.requirements.map((req) => (
                      <ComplianceField key={req.id} control={form.control} requirement={req} />
                    ))}
                  </div>
                )}
                
                {stateCompliance && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Requirements for {stateCompliance.name}</h3>
                    {stateCompliance.requirements.map((req) => (
                      <ComplianceField key={req.id} control={form.control} requirement={req} />
                    ))}
                  </div>
                )}

                {watchCountry === 'AU' && !watchRegion && <p className="text-muted-foreground">Please select your state/territory to see specific compliance requirements.</p>}
            </CardContent>
          </Card>


          {/* Section 8: Pricing & Submission */}
          <Card>
            <CardHeader>
              <CardTitle>8. Pricing & Final Agreements</CardTitle>
              <CardDescription>Set your price and agree to our guidelines to submit your application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="experience.pricing.pricePerGuest" render={({ field }) => (
                  <FormItem><FormLabel>Price per Guest (USD)</FormLabel><FormControl><Input {...field} type="number" min="10" /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="compliance.agreeToFoodSafety" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I acknowledge my food safety responsibilities.</FormLabel>
                        <FormDescription>I understand that I am responsible for preparing food safely and in accordance with local laws. Go2Culture is a platform, not a food provider.</FormDescription>
                      </div>
                    </FormItem>
                )}/>

                <FormField control={form.control} name="compliance.guidelinesAccepted" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the Go2Culture Host Guidelines.</FormLabel>
                        <FormDescription>This includes respecting guests, maintaining hygiene, and following all platform rules.</FormDescription>
                      </div>
                    </FormItem>
                )}/>
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
