'use client';

import React from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
    defaultValues: {
      fullName: '',
    },
    disabled: !userProfile,
  });

  React.useEffect(() => {
    if (userProfile) {
      form.reset({ fullName: userProfile.fullName });
    }
  }, [userProfile, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore || !auth.currentUser) return;

    try {
      // Update Firestore document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { fullName: data.fullName });

      // Update Auth profile
      await updateProfile(auth.currentUser, { displayName: data.fullName });
      
      toast({
        title: "Profile Updated",
        description: "Your name has been successfully updated.",
      });
      // Force a reload of the user to get the new displayName in the header
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

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="space-y-6 py-12">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4 mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push('/login?redirect=/profile');
    return null;
  }
  
  const userImage = PlaceHolderImages.find(p => p.id === userProfile?.profilePhotoId);


  return (
    <div className="space-y-6 py-12">
      <div>
        <h1 className="text-3xl font-headline font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and edit your personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your name and view your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.photoURL ? <AvatarImage src={user.photoURL} alt={userProfile?.fullName || 'User'} /> :
               userImage ? <AvatarImage src={userImage.imageUrl} alt={userProfile?.fullName || 'User'} /> : null}
              <AvatarFallback>{userProfile?.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{userProfile?.fullName}</p>
              <p className="text-muted-foreground">{userProfile?.email}</p>
            </div>
          </div>
        
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
