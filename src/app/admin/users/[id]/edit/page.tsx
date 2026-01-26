
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateUserByAdmin } from '@/lib/admin-actions';
import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ADMIN_UID } from '@/lib/auth';

const userEditSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  role: z.enum(['guest', 'host', 'both']),
  status: z.enum(['active', 'suspended', 'deleted']),
});

type UserFormValues = z.infer<typeof userEditSchema>;

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const userId = params.id as string;
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const userRef = useMemoFirebase(
    () => (firestore && userId ? doc(firestore, 'users', userId) : null),
    [firestore, userId]
  );
  const { data: user, isLoading } = useDoc<User>(userRef);

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userEditSchema),
    values: {
      fullName: user?.fullName || '',
      role: user?.role || 'guest',
      status: user?.status || 'active',
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (!firestore) return;

    if (userId === ADMIN_UID && data.status !== 'active') {
        toast({
            variant: "destructive",
            title: "Action Forbidden",
            description: "The admin user cannot be suspended or deleted.",
        });
        return;
    }

    setSaveState('saving');
    try {
        await updateUserByAdmin(firestore, userId, data);
        toast({
            title: "User Updated!",
            description: "The user's details have been saved successfully.",
        });
        setSaveState('saved');
        methods.reset(data);
        setTimeout(() => setSaveState('idle'), 2000);
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "Could not save user details.",
        });
        setSaveState('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <div>User not found.</div>;
  }
  
  const userImage = PlaceHolderImages.find(p => p.id === user.profilePhotoId);
  const isAdmin = user.id === ADMIN_UID;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold">Edit User</h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-2">
                    <Avatar className="h-8 w-8">
                        {userImage && <AvatarImage src={userImage.imageUrl} alt={user.fullName} />}
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.fullName} ({user.email})</span>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" asChild><Link href="/admin/users">Cancel</Link></Button>
                <Button type="submit" disabled={saveState !== 'idle' || !methods.formState.isDirty}>
                    {saveState === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saveState === 'saved' && <Check className="mr-2 h-4 w-4" />}
                    {saveState === 'saved' ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>
        </div>
        
        <Card>
          <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={methods.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid md:grid-cols-2 gap-4">
                 <FormField control={methods.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="guest">Guest</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>
                )} />
                 <FormField control={methods.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isAdmin}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                         <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
