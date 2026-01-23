'use client';

import React from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
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
      await updateDoc(userRef, { fullName: data.fullName });

      await updateProfile(auth.currentUser, { displayName: data.fullName });
      
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
      
      await auth.currentUser.reload();
      router.refresh(); 
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

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your public name. This will be visible to hosts and guests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
              <fieldset disabled={form.formState.isSubmitting || !userProfile}>
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
                <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty} className="mt-4">
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>
      </Card>
      
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
