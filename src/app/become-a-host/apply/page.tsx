
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, FormProvider, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, User as UserIcon } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { HostApplication } from "@/lib/types";
import { complianceRequirementsByState, countryComplianceRequirements } from "@/lib/compliance-data";

import { Step1BasicInfo } from "@/components/apply-form/step1-basic-info";
import { Step2HostProfile } from "@/components/apply-form/step2-host-profile";
import { Step3ExperienceBasics } from "@/components/apply-form/step3-experience-basics";
import { Step4Menu } from "@/components/apply-form/step4-menu";
import { Step5Location } from "@/components/apply-form/step5-location";
import { Step6Photos } from "@/components/apply-form/step6-photos";
import { Step7Compliance } from "@/components/apply-form/step7-compliance";
import { Step8Pricing } from "@/components/apply-form/step8-pricing";
import { Progress } from "@/components/ui/progress";

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
    description: z.string().min(50, "A compelling description is required (min. 50 characters)."),
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
    suburb: z.string({ required_error: "Please select your suburb/city."}),
    localArea: z.string().optional(),
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

const steps = [
    {
        id: 'Step 1',
        name: 'Basic Information',
        fields: ['fullName', 'email'],
    },
    {
        id: 'Step 2',
        name: 'Host Profile',
        fields: ['profile.bio', 'profile.languages', 'profile.culturalBackground', 'profile.hostingStyles'],
    },
    {
        id: 'Step 3',
        name: 'Experience Basics',
        fields: ['experience.title', 'experience.description', 'experience.category', 'experience.durationMinutes'],
    },
    {
        id: 'Step 4',
        name: 'Menu & Food Details',
        fields: ['experience.menu.description', 'experience.menu.cuisine', 'experience.menu.spiceLevel'],
    },
    {
        id: 'Step 5',
        name: 'Location & Home Setup',
        fields: ['location', 'homeSetup'],
    },
    {
        id: 'Step 6',
        name: 'Photos',
        fields: [],
    },
    {
        id: 'Step 7',
        name: 'Compliance',
        fields: [], // Complex validation, handled on final submit
    },
    {
        id: 'Step 8',
        name: 'Pricing & Agreements',
        fields: ['experience.pricing.pricePerGuest', 'compliance.agreeToFoodSafety', 'compliance.guidelinesAccepted'],
    },
];

export default function BecomeAHostPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.displayName || '',
      email: user?.email || '',
      profile: {
        hostingStyles: [],
        bio: '',
        culturalBackground: '',
        languages: '',
      },
      experience: {
        title: '',
        description: '',
        menu: {
          cuisine: '',
          description: '',
          allergens: '',
        },
        pricing: { pricePerGuest: 50 },
      },
      location: {
        address: '',
        postcode: '',
        suburb: '',
        localArea: '',
      },
      homeSetup: {
        pets: false,
        smoking: false,
        maxGuests: 4,
        accessibility: '',
      },
      compliance: {
        guidelinesAccepted: false,
        agreeToFoodSafety: false,
        councilName: ''
      }
    },
  });

  async function nextStep() {
    const fields = steps[currentStep].fields;
    const output = await methods.trigger(fields as FieldPath<OnboardingFormValues>[], { shouldFocus: true });
    
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
          profilePhotoId: "guest-1", // Placeholder
        },
        experience: {
          ...experienceData,
          description: experienceData.description || '',
          photos: { mainImageId: "dining-area" }
        },
        verification: {
          idDocId: "admin-id", 
          selfieId: "admin-selfie",
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
          Join our community of hosts by completing the {steps.length} steps below.
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 mt-12 max-w-4xl mx-auto">
            
            <div className="px-4 py-2 space-y-4">
                <Progress value={((currentStep + 1) / steps.length) * 100} />
                <p className="text-center text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
            </div>

            {currentStep === 0 && <Step1BasicInfo />}
            {currentStep === 1 && <Step2HostProfile hostingStyleOptions={hostingStyleOptions} />}
            {currentStep === 2 && <Step3ExperienceBasics />}
            {currentStep === 3 && <Step4Menu />}
            {currentStep === 4 && <Step5Location />}
            {currentStep === 5 && <Step6Photos />}
            {currentStep === 6 && <Step7Compliance />}
            {currentStep === 7 && <Step8Pricing />}

            <div className="flex gap-4 justify-end">
                {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                    </Button>
                )}
                {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={nextStep}>
                        Next
                    </Button>
                )}
                {currentStep === steps.length - 1 && (
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
                )}
            </div>
        </form>
      </FormProvider>
    </div>
  );
}

