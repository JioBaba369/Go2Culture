'use client';

import React, { useState } from 'react';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, collection, where, query } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Twitter, Instagram, Facebook, Eye, Globe, Flag, ShieldCheck, Trophy, Award } from 'lucide-react';
import { User, Host, Experience } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { countries } from '@/lib/location-data';
import { getFlagFromCountryCode } from '@/lib/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ExperienceCard } from '@/components/experience-card';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  brandName: z.string().optional(),
  nativeLanguage: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialMedia: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
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

const getUsernameFromUrl = (url: string | undefined): string => {
  if (!url) return '';
  try {
    const urlObject = new URL(url);
    const pathParts = urlObject.pathname.split('/').filter(Boolean);
    return pathParts[0] || '';
  } catch {
    // If it's not a valid URL, it might be a username already.
    return url;
  }
};

const languages = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)", "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Korean", "Kurdish (Kurmanji)", "Kyrgyz", "Lao", "Latin", "Latvian", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Romanian", "Russian", "Samoan", "Scots Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik", "Tamil", "Telugu", "Thai", "Turkish", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu", "Other"
];

export default function ProfilePage() {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [profileSaveState, setProfileSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [passwordSaveState, setPasswordSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

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
    values: {
      fullName: userProfile?.fullName || '',
      brandName: userProfile?.brandName || '',
      nativeLanguage: userProfile?.nativeLanguage || '',
      phone: userProfile?.phone || '',
      website: userProfile?.website || '',
      location: {
        city: userProfile?.location?.city || '',
        country: userProfile?.location?.country || '',
      },
      socialMedia: {
        twitter: getUsernameFromUrl(userProfile?.socialMedia?.twitter),
        instagram: getUsernameFromUrl(userProfile?.socialMedia?.instagram),
        facebook: getUsernameFromUrl(userProfile?.socialMedia?.facebook),
      },
    },
  });

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
    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      const dataToSave = {
        fullName: data.fullName,
        brandName: data.brandName,
        nativeLanguage: data.nativeLanguage,
        phone: data.phone,
        website: data.website,
        location: {
            ...userProfile?.location, // Preserve existing fields like region/suburb
            city: data.location?.city,
            country: data.location?.country
        },
        socialMedia: {
          twitter: data.socialMedia?.twitter ? `https://x.com/${data.socialMedia.twitter.replace('@', '')}` : '',
          instagram: data.socialMedia?.instagram ? `https://instagram.com/${data.socialMedia.instagram.replace('@', '')}` : '',
          facebook: data.socialMedia?.facebook ? `https://facebook.com/${data.socialMedia.facebook.replace('@', '')}` : '',
        },
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, dataToSave as any);

      if (auth.currentUser.displayName !== data.fullName) {
        await updateProfile(auth.currentUser, { displayName: data.fullName });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setProfileSaveState('saved');
      await auth.currentUser.reload();
      router.refresh(); 
      form.reset(data); // Resets the dirty state
      setTimeout(() => setProfileSaveState('idle'), 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
      setProfileSaveState('idle');
    }
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
             <div className="flex items-center gap-2">
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
                {userProfile.brandName && (<p className="text-lg">{userProfile.brandName}</p>)}
                {userProfile.location?.country && (
                    <div className="flex items-center gap-1.5">
                        {userProfile.brandName && <span className="text-sm mx-1">•</span>}
                        {getFlagFromCountryCode(userProfile.location.country)}
                        <span>From {countryName}</span>
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
          <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <Card>
                      <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                          <CardDescription>Update your public name and contact details.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Your full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="brandName"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Brand Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Your public brand name (optional)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                           <FormField
                            control={form.control}
                            name="nativeLanguage"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Native Language</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang} value={lang.toLowerCase()}>{lang}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                          />
                          <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Your phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="location.country"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Select country..." />
                                      </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                      {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                              <FormField
                              control={form.control}
                              name="location.city"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl><Input placeholder="Your city" {...field} /></FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                              />
                          </div>
                          <FormField
                              control={form.control}
                              name="website"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Website</FormLabel>
                                  <FormControl>
                                      <Input placeholder="https://your-website.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </CardContent>
                  </Card>

                  <Card>
                      <CardHeader>
                      <CardTitle>Social Media</CardTitle>
                      <CardDescription>Link your social media profiles. Enter your handle only.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <FormField
                              control={form.control}
                              name="socialMedia.twitter"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>X</FormLabel>
                                  <div className="group flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                      <div className="grid h-full place-items-center px-3 text-muted-foreground">
                                          <Twitter className="h-5 w-5" />
                                      </div>
                                      <span className="shrink-0 text-muted-foreground">https://x.com/</span>
                                      <FormControl>
                                          <Input
                                          placeholder="your_handle"
                                          {...field}
                                          className="h-full w-full border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                                          />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="socialMedia.instagram"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Instagram</FormLabel>
                                  <div className="group flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                      <div className="grid h-full place-items-center px-3 text-muted-foreground">
                                          <Instagram className="h-5 w-5" />
                                      </div>
                                      <span className="shrink-0 text-muted-foreground">https://instagram.com/</span>
                                      <FormControl>
                                          <Input
                                          placeholder="your_handle"
                                          {...field}
                                          className="h-full w-full border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                                          />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name="socialMedia.facebook"
                              render={({ field }) => (
                                  <FormItem>
                                  <FormLabel>Facebook</FormLabel>
                                  <div className="group flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                      <div className="grid h-full place-items-center px-3 text-muted-foreground">
                                          <Facebook className="h-5 w-5" />
                                      </div>
                                      <span className="shrink-0 text-muted-foreground">https://facebook.com/</span>
                                      <FormControl>
                                          <Input
                                          placeholder="your_handle"
                                          {...field}
                                          className="h-full w-full border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                                          />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </CardContent>
                      <CardFooter>
                          <Button type="submit" disabled={profileSaveState === 'saving' || !form.formState.isDirty}>
                              {profileSaveState === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {profileSaveState === 'saved' && <Check className="mr-2 h-4 w-4" />}
                              {profileSaveState === 'saved' ? 'Saved!' : 'Save Profile Changes'}
                          </Button>
                      </CardFooter>
                  </Card>
              </form>
          </Form>

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
                        {(userProfile.nativeLanguage || (host.profile.languages && host.profile.languages.length > 0)) && (
                            <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                {userProfile.nativeLanguage && <p><span className="font-semibold">Native:</span> <span className="capitalize text-muted-foreground">{userProfile.nativeLanguage}</span></p>}
                                {host.profile.languages && host.profile.languages.length > 0 && <p className={cn(userProfile.nativeLanguage && 'mt-1')}><span className="font-semibold">Speaks:</span> <span className="capitalize text-muted-foreground">{host.profile.languages.join(', ')}</span></p>}
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
                        {userProfile.nativeLanguage ? (
                        <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                            <p><span className="font-semibold">Native Language:</span> <span className="capitalize text-muted-foreground">{userProfile.nativeLanguage}</span></p>
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
                            <span className="truncate">@{getUsernameFromUrl(userProfile.socialMedia.twitter)}</span>
                        </a>
                    )}
                    {userProfile.socialMedia?.instagram && (
                        <a href={userProfile.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">@{getUsernameFromUrl(userProfile.socialMedia.instagram)}</span>
                        </a>
                    )}
                    {userProfile.socialMedia?.facebook && (
                        <a href={userProfile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors group">
                            <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="truncate">{getUsernameFromUrl(userProfile.socialMedia.facebook)}</span>
                        </a>
                    )}
                    {!userProfile.website && !userProfile.socialMedia?.twitter && !userProfile.socialMedia?.instagram && !userProfile.socialMedia?.facebook && (
                        <p className="text-muted-foreground">No social links provided.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
