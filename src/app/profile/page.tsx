
'use client';

import React, { useState } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
import { Loader2, Check, Twitter, Instagram, Facebook, Eye, Globe } from 'lucide-react';
import { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { countries } from '@/lib/location-data';
import { getFlagFromCountryCode } from '@/lib/format';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const isLoading = isUserLoading || isProfileLoading;

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
              <h1 className="text-3xl font-headline font-bold">Welcome back, {userProfile.fullName.split(' ')[0]}</h1>
              <p className="text-muted-foreground">Manage your account settings and personal information.</p>
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="md:col-span-2 space-y-8">
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
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="spanish">Spanish</SelectItem>
                                        <SelectItem value="french">French</SelectItem>
                                        <SelectItem value="german">German</SelectItem>
                                        <SelectItem value="italian">Italian</SelectItem>
                                        <SelectItem value="mandarin">Mandarin</SelectItem>
                                        <SelectItem value="hindi">Hindi</SelectItem>
                                        <SelectItem value="arabic">Arabic</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
      
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>This information is private and not shared with other users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 md:grid-cols-1 gap-4">
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
                        {userProfile.location?.country && countryName && (
                        <div>
                            <Label>Country</Label>
                            <p className="text-muted-foreground flex items-center gap-2">
                                {getFlagFromCountryCode(userProfile.location.country)}
                                {countryName}
                            </p>
                        </div>
                        )}
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
        </div>
      </div>
    </div>
  );
}
