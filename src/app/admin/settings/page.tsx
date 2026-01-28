'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PlatformSetting } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { updateSettings } from '@/lib/actions/admin/settings-actions';
import { Check, Loader2 } from 'lucide-react';

const settingsSchema = z.object({
  referralAmount: z.coerce.number().min(0, "Referral amount cannot be negative."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

    const settingsRef = useMemoFirebase(() => (firestore ? doc(firestore, 'platformSettings', 'config') : null), [firestore]);
    const { data: settings, isLoading } = useDoc<PlatformSetting>(settingsRef);
    
    const methods = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            referralAmount: 10,
        },
    });

    useEffect(() => {
        if (settings) {
            methods.reset({
                referralAmount: settings.referralAmount || 10,
            });
        }
    }, [settings, methods]);
    
    async function onSubmit(data: SettingsFormValues) {
        if (!firestore) return;
        setSaveState('saving');
        try {
            await updateSettings(firestore, data);
            toast({ title: "Settings Updated", description: "Platform settings have been saved." });
            setSaveState('saved');
            methods.reset(data); // Mark form as not dirty
             setTimeout(() => setSaveState('idle'), 2000);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
            setSaveState('idle');
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                 <div>
                    <h1 className="text-3xl font-headline font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage global platform settings.</p>
                </div>
                <Card>
                    <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-10 w-1/2" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage global platform settings.</p>
            </div>

             <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Referral Program</CardTitle>
                            <CardDescription>Configure the referral reward amount.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={methods.control}
                                name="referralAmount"
                                render={({ field }) => (
                                    <FormItem className="max-w-sm">
                                        <FormLabel>Referral Credit Amount ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                         <CardFooter>
                            <Button type="submit" disabled={saveState !== 'idle' || !methods.formState.isDirty}>
                                {saveState === 'saving' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {saveState === 'saved' && <Check className="mr-2 h-4 w-4" />}
                                {saveState === 'saved' ? 'Saved!' : 'Save Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </FormProvider>
        </div>
    );
}
