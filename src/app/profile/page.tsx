
'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, collection, where, query } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile, signOut } from 'firebase/auth';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Twitter, Instagram, Facebook, Eye, Globe, Flag, ShieldCheck, Trophy, Award, Languages, CalendarIcon, Trash2 } from 'lucide-react';
import { User, Host, Experience } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { countries } from '@/lib/location-data';
import { getFlagFromCountryCode } from '@/lib/format';
import { Separator } from '@/components/ui/separator';
import { ExperienceCard } from '@/components/experience-card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { logAudit } from '@/lib/audit-actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { softDeleteUserAccount } from '@/lib/user-actions';
import { ADMIN_UID } from '@/lib/auth';

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  bio: z.string().max(150, "Your bio should not exceed 150 characters.").optional(),
  profession: z.string().optional(),
  location: z.object({ city: z.string().optional(), }).optional(),
  languages: z.string().optional(),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  socialMedia: z.object({
    twitter: z.string().url("Invalid URL").optional().or(z.literal('')),
    instagram: z.string().url("Invalid URL").optional().or(z.literal('')),
    facebook: z.string().url("Invalid URL").optional().or(z.literal('')),
  }).optional(),
  
  // Private
  birthDate: z.date({
      coerce: true,
      errorMap: (issue, { defaultError }) => ({
        message: issue.code === "invalid_date" ? "That's not a valid date!" : defaultError.message,
      })
    }).optional(),
  phone: z.string().optional(),

  // Preferences
  preferences: z.object({
    guiltyPleasures: z.string().optional(),
    cuisines: z.string().optional(),
    dietary: z.string().optional(),
  }).optional(),
});


const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters long."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const getUsername = (url?: string) => {
    if (!url) return '';
    try {
      const path = new URL(url).pathname;
      return path.substring(1).replace(/\/$/, ''); // remove leading/trailing slashes
    } catch (e) {
      return url; // fallback to showing the raw value if it's not a valid URL
    }
};

export default function ProfilePage() {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [profileSaveState, setProfileSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [passwordSaveState, setPasswordSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isDeleting, setIsDeleting] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
  
  // Fetch Host document (if the user is a host)
  const hostRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid, 'hosts', user.uid) : null), [firestore, user]);
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  // Fetch user's experiences
  const experiencesQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'experiences'), where('userId', '==', user.uid), where('status', '==', 'live')) : null),
    [firestore, user]
  );
  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(experiencesQuery);
  

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        fullName: '',
        bio: '',
        profession: '',
        location: { city: '' },
        languages: '',
        website: '',
        socialMedia: {
          twitter: '',
          instagram: '',
          facebook: '',
        },
        phone: '',
        preferences: {
            guiltyPleasures: '',
            cuisines: '',
            dietary: '',
        }
    }
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            fullName: userProfile.fullName || '',
            bio: userProfile.bio || '',
            profession: userProfile.profession || '',
            website: userProfile.website || '',
            socialMedia: {
                twitter: userProfile.socialMedia?.twitter || '',
                instagram: userProfile.socialMedia?.instagram || '',
                facebook: userProfile.socialMedia?.facebook || '',
            },
            birthDate: userProfile.birthDate ? new Date(userProfile.birthDate) : undefined,
            location: {
                city: userProfile.location?.city || '',
            },
            phone: userProfile.phone || '',
            languages: userProfile.languages?.join(', ') || '',
            preferences: {
                guiltyPleasures: userProfile.preferences?.guiltyPleasures || '',
                cuisines: userProfile.preferences?.cuisines?.join(', ') || '',
                dietary: userProfile.preferences?.dietary?.join(', ') || '',
            }
        });
    }
  }, [userProfile, form]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    },
  });


  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [isUserLoading, user, router]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore || !auth.currentUser || profileSaveState === 'saving') {
      return;
    }
    setProfileSaveState('saving');
    
    const userRef = doc(firestore, 'users', user.uid);
    const dataToSave: Partial<User> = {
        fullName: data.fullName,
        bio: data.bio,
        profession: data.profession,
        website: data.website,
        socialMedia: {
            ...userProfile?.socialMedia,
            twitter: data.socialMedia?.twitter,
            instagram: data.socialMedia?.instagram,
            facebook: data.socialMedia?.facebook,
        },
        birthDate: data.birthDate ? data.birthDate.toISOString().split('T')[0] : undefined,
        location: {
            ...userProfile?.location,
            city: data.location?.city,
        },
        phone: data.phone,
        languages: data.languages ? data.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferences: {
            ...userProfile?.preferences,
            guiltyPleasures: data.preferences?.guiltyPleasures,
            cuisines: data.preferences?.cuisines ? data.preferences.cuisines.split(',').map(s => s.trim()).filter(Boolean) : [],
            dietary: data.preferences?.dietary ? data.preferences.dietary.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        updatedAt: serverTimestamp()
    };
    
    // Non-blocking update to Firestore
    updateDoc(userRef, dataToSave as any)
        .then(async () => {
            // After successful Firestore update, update Auth profile and UI
            if (auth.currentUser!.displayName !== data.fullName) {
                await updateProfile(auth.currentUser!, { displayName: data.fullName });
            }
            logAudit(firestore, { actor: userProfile!, action: 'UPDATE_PROFILE', target: { type: 'user', id: user.uid }});
            toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
            setProfileSaveState('saved');
            form.reset(data);
            setTimeout(() => setProfileSaveState('idle'), 3000);
            await auth.currentUser!.reload(); // Reload auth user to get latest profile
        })
        .catch(serverError => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userRef.path,
                operation: 'update',
                requestResourceData: dataToSave
            }));
            setProfileSaveState('idle');
        });
  }

  async function onPasswordChangeSubmit(data: PasswordFormValues) {
    if (!user || !user.email) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not found.'});
        return;
    }
    setPasswordSaveState('saving');

    try {
        const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        await updatePassword(user, data.newPassword);

        toast({
            title: "Password Changed",
            description: "Your password has been updated successfully.",
        });
        setPasswordSaveState('saved');
        passwordForm.reset();
        setTimeout(() => setPasswordSaveState('idle'), 3000);

    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Password Change Failed",
            description: error.code === 'auth/invalid-credential' ? 'Your current password is incorrect.' : 'An error occurred. Please try again.'
        });
         setPasswordSaveState('idle');
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !userProfile || !firestore || !auth) return;

    if (user.uid === ADMIN_UID) {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "The admin account cannot be deleted.",
        });
        return;
    }

    setIsDeleting(true);
    try {
        await softDeleteUserAccount(firestore, userProfile);

        // Sign the user out after successful soft-delete
        if (auth) {
            await signOut(auth);
        }
        
        toast({
            title: "Account Deleted",
            description: "Your account has been successfully deleted. We're sad to see you go.",
        });

        router.push('/');

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "An error occurred while deleting your account.",
        });
        setIsDeleting(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading || isHostLoading;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4 mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }
  
  const userImage = PlaceHolderImages.find(p => p.id === userProfile?.profilePhotoId);
  const countryName = userProfile.location?.country ? countries.find(c => c.id === userProfile.location.country)?.name : '';
  const isHost = userProfile.role === 'host' || userProfile.role === 'both';
  const isAdmin = user.id === ADMIN_UID;


  const roleVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
    host: "secondary",
    guest: "outline",
    both: "default",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
              {userImage ? <AvatarImage src={userImage.imageUrl} alt={userProfile?.fullName || 'User'} /> : null}
              <AvatarFallback className="text-3xl">{userProfile?.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
             <div className="flex items-center gap-3">
                <h1 className="font-headline text-4xl font-bold">{userProfile.fullName}</h1>
                {isHost && host?.verification?.idVerified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <ShieldCheck className="h-7 w-7 text-green-600" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified Host</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-muted-foreground">
                {userProfile.brandName && (<p className="text-lg font-medium">{userProfile.brandName}</p>)}
                
                {userProfile.location?.city && user.location?.country && <span className="hidden sm:block text-muted-foreground/50 mx-1">•</span>}

               {user.location?.country && (
                    <div className="flex items-center gap-2">
                        {getFlagFromCountryCode(user.location.country)}
                        <span>{user.location.city ? `${user.location.city}, ${countryName}`: countryName}</span>
                    </div>
                )}
            </div>
          </div>
        </div>
         <Button asChild variant="outline">
            <Link href={`/users/${user.uid}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
            </Link>
        </Button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>A friendly photo helps build trust in our community.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            {userImage ? <AvatarImage src={userImage.imageUrl} alt={userProfile?.fullName || 'User'} /> : null}
                            <AvatarFallback className="text-3xl">{userProfile?.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline" disabled>Change profile picture</Button>
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Public Details</CardTitle><CardDescription>This information may be visible to other users.</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Your name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel>About you</FormLabel><FormDescription>Help others get to know you. What do you like? Where have you travelled?</FormDescription><FormControl><Textarea placeholder="Go2Culture is all about people! Help future guests get to know you. Tell them about the things you like: your food preferences, favorite travel destination, etc.." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="profession" render={({ field }) => (
                      <FormItem><FormLabel>Profession</FormLabel><FormControl><Input placeholder="Chef, alpinist, superhero..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="location.city" render={({ field }) => (
                      <FormItem><FormLabel>Your city</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="languages" render={({ field }) => (
                        <FormItem><FormLabel>Languages you speak</FormLabel><FormDescription>Separate with commas</FormDescription><FormControl><Input placeholder="English, French, Spanish..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Online Presence</CardTitle><CardDescription>Add links to your website and social media profiles.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="website" render={({ field }) => (
                            <FormItem><FormLabel>Website</FormLabel><FormControl><div className="relative flex items-center">
                                <Globe className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-9" placeholder="https://your-website.com"/>
                            </div></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="socialMedia.twitter" render={({ field }) => (
                            <FormItem><FormLabel>Twitter / X</FormLabel><FormControl><div className="relative flex items-center">
                                <Twitter className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-9" placeholder="https://x.com/username"/>
                            </div></FormControl><FormMessage/></FormItem>
                        )}/>
                         <FormField control={form.control} name="socialMedia.instagram" render={({ field }) => (
                            <FormItem><FormLabel>Instagram</FormLabel><FormControl><div className="relative flex items-center">
                                <Instagram className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-9" placeholder="https://instagram.com/username"/>
                            </div></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField control={form.control} name="socialMedia.facebook" render={({ field }) => (
                            <FormItem><FormLabel>Facebook</FormLabel><FormControl><div className="relative flex items-center">
                                <Facebook className="absolute left-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-9" placeholder="https://facebook.com/username"/>
                            </div></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Personalization</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem><FormLabel>Your birth date</FormLabel><FormDescription>Only used to personalize your experience. Not shown publicly.</FormDescription>
                                <Popover><PopoverTrigger asChild>
                                    <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus captionLayout="dropdown-buttons" fromYear={1900} toYear={new Date().getFullYear()}/>
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone number</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Only shared with hosts/guests after a booking is confirmed.</FormDescription><FormMessage /></FormItem>
                        )}/>
                        <Separator/>
                         <FormField control={form.control} name="preferences.guiltyPleasures" render={({ field }) => (
                            <FormItem><FormLabel>Guilty pleasures</FormLabel><FormControl><Input placeholder="e.g.: Chocolate, chocolate and chocolate ;)" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="preferences.cuisines" render={({ field }) => (
                            <FormItem><FormLabel>Your favorite cuisines to enjoy</FormLabel><FormDescription>Separate with commas</FormDescription><FormControl><Input placeholder="e.g.: Italian, Japanese..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="preferences.dietary" render={({ field }) => (
                            <FormItem><FormLabel>My dietary restrictions</FormLabel><FormDescription>Separate with commas</FormDescription><FormControl><Input placeholder="e.g.: Vegetarian, gluten-free..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>

                <div className="flex justify-start">
                    <Button type="submit" disabled={profileSaveState !== 'idle' || !form.formState.isDirty}>
                        {profileSaveState === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {profileSaveState === 'saved' && <Check className="mr-2 h-4 w-4" />}
                        {profileSaveState === 'saved' ? 'Saved!' : 'Save Profile Changes'}
                    </Button>
                </div>
              </form>
          </FormProvider>

           {areExperiencesLoading ? <Skeleton className="h-80 w-full" /> : experiences && experiences.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-headline text-2xl font-semibold">Your Experiences</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {experiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
                  </div>
              </div>
            )}
        </div>
      
        <div className="md:col-span-1 space-y-8">
             {isHost && host ? (
                <div className="p-6 border rounded-xl shadow-sm bg-card">
                    <h3 className="font-headline text-xl font-semibold mb-4">About {userProfile.fullName.split(' ')[0]}</h3>
                    
                    {host.profile.bio && (
                        <p className="text-muted-foreground leading-relaxed mb-4">{host.profile.bio}</p>
                    )}

                     <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                           {host.level === 'Superhost' && (
                                <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                <span>Superhost</span>
                                </div>
                            )}
                        </div>
                        {host.profile.culturalBackground && (
                            <div className="flex items-center gap-3">
                            <Flag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <span>{host.profile.culturalBackground}</span>
                            </div>
                        )}
                        {userProfile.languages && userProfile.languages.length > 0 && (
                            <div className="flex items-start gap-3">
                                <Languages className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                <p><span className="font-semibold">Speaks:</span> <span className="capitalize text-muted-foreground">{userProfile.languages.join(', ')}</span></p>
                                </div>
                            </div>
                        )}
                    </div>
                    {host.profile.achievements && host.profile.achievements.length > 0 && (
                        <>
                        <Separator className="my-4" />
                        <h4 className="font-semibold mb-2 text-sm">Achievements</h4>
                        <div className="flex flex-wrap gap-2">
                            {host.profile.achievements.map((achievement) => (
                            <Badge key={achievement} variant="outline" className="font-normal py-1">
                                <Trophy className="h-4 w-4 mr-2 text-amber-500"/>
                                {achievement}
                            </Badge>
                            ))}
                        </div>
                        </>
                    )}
                    {host.profile.hostingStyles && host.profile.hostingStyles.length > 0 && (
                        <>
                        <Separator className="my-4" />
                        <h4 className="font-semibold mb-2 text-sm">Hosting Style</h4>
                        <div className="flex flex-wrap gap-2">
                            {host.profile.hostingStyles.map(style => <Badge key={style} variant="secondary">{style}</Badge>)}
                        </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="p-6 border rounded-xl shadow-sm bg-card">
                    <h3 className="font-headline text-xl font-semibold mb-4">About</h3>
                    <div className="space-y-4 text-sm">
                        {userProfile.languages && userProfile.languages.length > 0 ? (
                        <div className="flex items-start gap-3">
                            <Languages className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                            <p><span className="font-semibold">Speaks:</span> <span className="capitalize text-muted-foreground">{userProfile.languages.join(', ')}</span></p>
                            </div>
                        </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">This user hasn't shared many details yet.</p>
                        )}
                    </div>
                </div>
            )}
            
            <Card>
                <CardHeader>
                <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div>
                            <Label>Email Address</Label>
                            <p className="text-muted-foreground">{userProfile.email}</p>
                        </div>
                        <div>
                            <Label>Your Role</Label>
                            <div className="mt-1">
                                <Badge variant={roleVariantMap[userProfile.role]} className="capitalize">{userProfile.role}</Badge>
                            </div>
                        </div>
                        <div>
                            <Label>Member Since</Label>
                            <p className="text-muted-foreground">{userProfile.createdAt?.toDate ? format(userProfile.createdAt.toDate(), 'PPP') : 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 border rounded-xl shadow-sm bg-card">
                <h3 className="font-headline text-xl font-semibold">Contact & Links</h3>
                <div className="space-y-4 mt-4 text-sm">
                    {userProfile.website && (
                        <a href={userProfile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Globe className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">{userProfile.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                    )}
                    {userProfile.socialMedia?.twitter && (
                        <a href={userProfile.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">@{getUsername(userProfile.socialMedia.twitter)}</span>
                        </a>
                    )}
                    {userProfile.socialMedia?.instagram && (
                        <a href={userProfile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">@{getUsername(userProfile.socialMedia.instagram)}</span>
                        </a>
                    )}
                    {userProfile.socialMedia?.facebook && (
                        <a href={userProfile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">{getUsername(userProfile.socialMedia.facebook)}</span>
                        </a>
                    )}
                    {!userProfile.website && !userProfile.socialMedia?.twitter && !userProfile.socialMedia?.instagram && !userProfile.socialMedia?.facebook && (
                        <p className="text-muted-foreground">No social links provided.</p>
                    )}
                </div>
            </div>

            <Card>
                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordChangeSubmit)}>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password. Make sure it's at least 6 characters long.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={passwordSaveState !== 'idle' || !passwordForm.formState.isDirty}>
                                {passwordSaveState === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {passwordSaveState === 'saved' && <Check className="mr-2 h-4 w-4" />}
                                {passwordSaveState === 'saved' ? 'Saved!' : 'Change Password'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        This action is permanent and cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isAdmin}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete your account and all associated data. You will be logged out immediately. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }))}>
                                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Yes, Delete My Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
