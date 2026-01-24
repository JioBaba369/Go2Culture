
'use client';

import React from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  socialMedia: z.object({
    twitter: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    instagram: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    facebook: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  }).optional(),
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isUserLoading, auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

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
      phone: userProfile?.phone || '',
      website: userProfile?.website || '',
      socialMedia: {
        twitter: userProfile?.socialMedia?.twitter || '',
        instagram: userProfile?.socialMedia?.instagram || '',
        facebook: userProfile?.socialMedia?.facebook || '',
      },
    },
  });

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [isUserLoading, user, router]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore || !auth.currentUser || form.formState.isSubmitting) {
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      const { fullName, ...contactData } = data;

      await updateDoc(userRef, { 
        fullName,
        ...contactData,
        updatedAt: serverTimestamp() 
      });

      if (auth.currentUser.displayName !== fullName) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      await auth.currentUser.reload();
      router.refresh(); 
      form.reset(data); // Resets the dirty state
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your profile. Please try again.",
      });
    }
  }

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 py-12">
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
  const roleVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive" | null | undefined> = {
    host: "secondary",
    guest: "outline",
    both: "default",
  };

  return (
    <div className="space-y-8 py-12">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
            {user.photoURL ? <AvatarImage src={user.photoURL} alt={userProfile?.fullName || 'User'} /> :
            userImage ? <AvatarImage src={userImage.imageUrl} alt={userProfile?.fullName || 'User'} /> : null}
            <AvatarFallback className="text-3xl">{userProfile?.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <h1 className="text-3xl font-headline font-bold">Welcome back, {userProfile.fullName.split(' ')[0]}</h1>
            <p className="text-muted-foreground">Manage your account settings and personal information.</p>
        </div>
      </div>

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
                <CardDescription>Link your social media profiles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="socialMedia.twitter"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                                <Input placeholder="https://twitter.com/your-profile" {...field} />
                            </FormControl>
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
                            <FormControl>
                                <Input placeholder="https://instagram.com/your-profile" {...field} />
                            </FormControl>
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
                            <FormControl>
                                <Input placeholder="https://facebook.com/your-profile" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
       </Form>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>This information is private and not shared with other users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
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

    </div>
  );
}
