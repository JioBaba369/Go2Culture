
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/location-data';
import { Banknote, DollarSign, Loader2, TrendingUp, Wallet } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { Booking, Host } from '@/lib/types';
import { isPast, isThisMonth, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { updatePayoutSettings } from '@/lib/host-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const payoutSchema = z.object({
  billingCountry: z.string().min(1, 'Billing country is required.'),
  accountHolderName: z.string().min(2, 'Account holder name is required.'),
  bsb: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required.'),
  routingNumber: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

function PayoutSummary({ bookings, isLoading }: { bookings: Booking[] | null, isLoading: boolean }) {
    const summary = useMemo(() => {
        if (!bookings) return { totalEarnings: 0, upcomingEarnings: 0, thisMonthEarnings: 0 };
        
        const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');

        // Payout is 85% of total price
        const totalEarnings = confirmedBookings
            .filter(b => isPast(b.bookingDate.toDate()))
            .reduce((sum, b) => sum + (b.totalPrice * 0.85), 0); 

        const upcomingEarnings = confirmedBookings
            .filter(b => !isPast(b.bookingDate.toDate()))
            .reduce((sum, b) => sum + (b.totalPrice * 0.85), 0);

        const thisMonthEarnings = confirmedBookings
            .filter(b => isThisMonth(b.bookingDate.toDate()) && isPast(b.bookingDate.toDate()))
            .reduce((sum, b) => sum + (b.totalPrice * 0.85), 0);

        return { totalEarnings, upcomingEarnings, thisMonthEarnings };
    }, [bookings]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        );
    }
    
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.totalEarnings.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Lifetime earnings from completed experiences.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Payouts</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.upcomingEarnings.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">From future confirmed bookings.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">This Month's Payout</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${summary.thisMonthEarnings.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Payout for completed bookings this month.</p>
                </CardContent>
            </Card>
        </div>
    )
}

function PayoutHistoryCardMobile({ booking }: { booking: Booking }) {
    return (
        <Card className="p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold">{booking.experienceTitle}</p>
                    <p className="text-sm text-muted-foreground">{format(booking.bookingDate.toDate(), 'PPP')}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">${(booking.totalPrice * 0.85).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">From ${booking.totalPrice.toFixed(2)}</p>
                </div>
            </div>
        </Card>
    )
}

export default function HostPayoutsSettingsPage() {
    const { toast } = useToast();
    const { user, firestore, isUserLoading } = useFirebase();
    const [isSaving, setIsSaving] = useState(false);

    const hostRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'users', user.uid, 'hosts', user.uid) : null), [user, firestore]);
    const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

    const bookingsQuery = useMemoFirebase(
        () => (user && firestore ? query(collection(firestore, 'bookings'), where('hostId', '==', user.uid)) : null),
        [user, firestore]
    );
    const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

    const pastConfirmedBookings = useMemo(() => {
        if (!bookings) return [];
        return bookings.filter(b => b.status === 'Confirmed' && isPast(b.bookingDate.toDate()))
                       .sort((a, b) => b.bookingDate.toDate().getTime() - a.bookingDate.toDate().getTime());
    }, [bookings]);
    
    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            billingCountry: '',
            accountHolderName: '',
            bsb: '',
            accountNumber: '',
            routingNumber: '',
            iban: '',
            swift: '',
        },
    });

    useEffect(() => {
        if (host?.billingCountry) {
            form.setValue('billingCountry', host.billingCountry);
        }
    }, [host, form]);

    const watchedBillingCountry = form.watch('billingCountry');

    const onSubmit = async (values: PayoutFormValues) => {
        if (!user || !firestore) return;
        setIsSaving(true);
        
        try {
            // 1. Save the non-sensitive billingCountry to Firestore
            await updatePayoutSettings(firestore, user.uid, user.uid, {
                billingCountry: values.billingCountry,
            });

            // 2. Simulate saving the sensitive bank details
            console.log("Simulating save of sensitive bank details:", {
                accountHolderName: values.accountHolderName,
                bsb: values.bsb,
                accountNumber: values.accountNumber,
                routingNumber: values.routingNumber,
                iban: values.iban,
                swift: values.swift,
            });
            
            toast({
                title: 'Billing Information Saved',
                description: 'Your payout details have been updated.',
            });
            form.reset(values); // Mark form as not dirty
        } catch(error: any) {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }
    
    const renderBankFields = () => {
        switch(watchedBillingCountry) {
            case 'AU':
                return (
                    <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="bsb"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>BSB</FormLabel>
                                        <FormControl><Input placeholder="e.g., 062-000" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Number</FormLabel>
                                        <FormControl><Input placeholder="e.g., 123456789" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                );
            case 'NZ':
                 return (
                    <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="accountNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl><Input placeholder="e.g., 01-2345-6789012-34" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                );
            case 'US':
                return (
                     <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="routingNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Routing Number</FormLabel>
                                        <FormControl><Input placeholder="e.g., 123456789" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Number</FormLabel>
                                        <FormControl><Input placeholder="e.g., 987654321" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="accountHolderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="iban"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IBAN</FormLabel>
                                    <FormControl><Input placeholder="e.g., GB29NWBK60161331926819" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="swift"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SWIFT/BIC Code</FormLabel>
                                    <FormControl><Input placeholder="e.g., NWBKGB2L" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                );
        }
    }

    const isLoading = isUserLoading || areBookingsLoading || isHostLoading;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Payouts</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">
                    Review your earnings and manage how you receive payments.
                </p>
            </div>
            
            <PayoutSummary bookings={bookings} isLoading={isLoading} />

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                    <CardDescription>Breakdown of earnings from completed experiences.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="grid gap-4 md:hidden">
                        {isLoading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                        {!isLoading && pastConfirmedBookings.length > 0 ? (
                            pastConfirmedBookings.map(booking => <PayoutHistoryCardMobile key={booking.id} booking={booking} />)
                        ) : (
                            !isLoading && <p className="text-center text-muted-foreground py-8">No completed bookings yet.</p>
                        )}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking Date</TableHead>
                                    <TableHead>Experience</TableHead>
                                    <TableHead className="text-center">Guests</TableHead>
                                    <TableHead>Total Booking</TableHead>
                                    <TableHead>Your Payout (85%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading && Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                                ))}
                                {!isLoading && pastConfirmedBookings.length > 0 ? (
                                    pastConfirmedBookings.map(booking => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{format(booking.bookingDate.toDate(), 'PPP')}</TableCell>
                                            <TableCell>{booking.experienceTitle}</TableCell>
                                            <TableCell className="text-center">{booking.numberOfGuests}</TableCell>
                                            <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                                            <TableCell className="font-semibold">${(booking.totalPrice * 0.85).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No completed bookings yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Banknote /> Your Bank Details</CardTitle>
                            <CardDescription>
                                We need this information in order to transfer the money you earn with Go2Culture to your bank account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Banknote className="h-4 w-4" />
                                <AlertTitle>Demonstration Only</AlertTitle>
                                <AlertDescription>
                                    For demonstration purposes, your full bank account details are not stored. Only the selected billing country is saved to your profile.
                                </AlertDescription>
                            </Alert>
                            <FormField
                                control={form.control}
                                name="billingCountry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Billing Country</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Please set your billing country" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {countries.map(country => (
                                                    <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchedBillingCountry && (
                                <div className="p-4 border rounded-md space-y-4 bg-muted/50">
                                    <h3 className="font-semibold">Enter Your Account Details</h3>
                                    {renderBankFields()}
                                </div>
                            )}
                        </CardContent>
                        {watchedBillingCountry && (
                            <CardFooter>
                                <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Save Payout Information
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </form>
            </Form>
        </div>
    );
}

    