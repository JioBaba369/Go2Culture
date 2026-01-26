'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/location-data';
import { Banknote, Loader2 } from 'lucide-react';

export default function HostPayoutsSettingsPage() {
    const { toast } = useToast();
    const [billingCountry, setBillingCountry] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
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
                        <div className="space-y-2">
                            <Label htmlFor="accountName">Account Holder Name</Label>
                            <Input id="accountName" placeholder="e.g., Jane Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bsb">BSB</Label>
                                <Input id="bsb" placeholder="e.g., 062-000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number</Label>
                                <Input id="accountNumber" placeholder="e.g., 123456789" />
                            </div>
                        </div>
                    </div>
                );
            case 'NZ':
                 return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountName">Account Holder Name</Label>
                            <Input id="accountName" placeholder="e.g., Jane Doe" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number</Label>
                            <Input id="accountNumber" placeholder="e.g., 01-2345-6789012-34" />
                        </div>
                    </div>
                );
            case 'US':
                return (
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountName">Account Holder Name</Label>
                            <Input id="accountName" placeholder="e.g., Jane Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="routingNumber">Routing Number</Label>
                                <Input id="routingNumber" placeholder="e.g., 123456789" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="accountNumber">Account Number</Label>
                                <Input id="accountNumber" placeholder="e.g., 987654321" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountName">Account Holder Name</Label>
                            <Input id="accountName" placeholder="e.g., Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">IBAN</Label>
                            <Input id="iban" placeholder="e.g., GB29NWBK60161331926819" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="swift">SWIFT/BIC Code</Label>
                            <Input id="swift" placeholder="e.g., NWBKGB2L" />
                        </div>
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
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Payout Information
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
