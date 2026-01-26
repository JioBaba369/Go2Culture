'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/location-data';
import { Banknote, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const payoutSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required.'),
  bsb: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required.'),
  routingNumber: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

export default function HostPayoutsSettingsPage() {
    const { toast } = useToast();
    const [billingCountry, setBillingCountry] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            accountHolderName: '',
            bsb: '',
            accountNumber: '',
            routingNumber: '',
            iban: '',
            swift: '',
        },
    });

    const onSubmit = (values: PayoutFormValues) => {
        setIsSaving(true);
        console.log("Simulating save with data:", values);
        // Simulate API call since we are not storing real bank data
        setTimeout(() => {
            toast({
                title: 'Billing Information Saved',
                description: 'Your payout details have been updated.',
            });
            setIsSaving(false);
        }, 1000);
    }
    
    const renderBankFields = () => {
        switch(billingCountry) {
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Payout Settings</h1>
                <p className="text-muted-foreground mt-2 max-w-3xl">
                    Manage how you receive payments for your experiences.
                </p>
            </div>
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
                            <div className="space-y-2">
                                <Label htmlFor="billingCountry">Billing Country</Label>
                                <Select onValueChange={setBillingCountry} value={billingCountry}>
                                    <SelectTrigger id="billingCountry">
                                        <SelectValue placeholder="Please set your billing country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(country => (
                                            <SelectItem key={country.id} value={country.id}>{country.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {billingCountry && (
                                <div className="p-4 border rounded-md space-y-4 bg-muted/50">
                                    <h3 className="font-semibold">Enter Your Account Details</h3>
                                    {renderBankFields()}
                                </div>
                            )}
                        </CardContent>
                        {billingCountry && (
                            <CardFooter>
                                <Button type="submit" disabled={isSaving}>
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
