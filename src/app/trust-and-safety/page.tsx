
'use client';

import { ShieldCheck, MessageCircle, Lock, UserCheck, Search, ShieldAlert, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

const safetyFeatures = [
    {
        icon: UserCheck,
        title: "Host & Guest Verification",
        description: "We verify hosts through government ID and selfie checks. Guests also provide information to build a trusted community profile."
    },
    {
        icon: Lock,
        title: "Secure Payments",
        description: "Our platform handles all transactions securely. Hosts are paid after the experience is completed, and guests are protected."
    },
    {
        icon: MessageCircle,
        title: "Secure Messaging",
        description: "Communicate with your host or guest through our platform before your experience. Your contact details remain private until a booking is confirmed."
    },
    {
        icon: Search,
        title: "Smart Reviews",
        description: "Our two-way review system ensures that both hosts and guests can share their feedback honestly, helping everyone make informed decisions."
    }
];

export default function TrustAndSafetyPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Trust & Safety</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Your safety is our foundation. We've built tools and policies to help you host and travel with confidence.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12 space-y-12">
                <div className="grid md:grid-cols-2 gap-8">
                     {safetyFeatures.map(feature => (
                         <Card key={feature.title} className="text-center">
                            <CardHeader className="items-center">
                                <div className="bg-primary/10 text-primary p-4 rounded-full">
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                         </Card>
                     ))}
                </div>

                <Card className="bg-muted/50">
                    <CardHeader className="text-center items-center">
                        <div className="flex justify-center mb-4">
                             <Banknote className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Insurance Framework</CardTitle>
                         <CardDescription className="max-w-2xl">To maintain a safe and sustainable platform, it's important for all users to understand their responsibilities regarding insurance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center max-w-2xl mx-auto">
                        <div>
                            <h4 className="font-semibold text-foreground">For Hosts</h4>
                            <p className="text-sm text-muted-foreground">You are required to have your own adequate insurance coverage. This typically includes homeowner's or renter's insurance that covers commercial or business activities. Please review your policy or speak with your provider to ensure you are covered for hosting paying guests. Go2Culture does **not** provide primary liability insurance for hosts.</p>
                        </div>
                         <div>
                            <h4 className="font-semibold text-foreground">For Guests</h4>
                            <p className="text-sm text-muted-foreground">We strongly recommend that all guests purchase their own travel insurance to cover unforeseen circumstances, such as travel disruptions, medical emergencies, or cancellations.</p>
                        </div>
                        <p className="text-xs text-muted-foreground pt-4">Go2Culture is a platform that connects people. We are not an insurance provider and do not cover damages, losses, or injuries that may occur during an experience.</p>
                    </CardContent>
                </Card>

                <div className="bg-card p-8 rounded-lg text-center">
                     <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
                     <h2 className="font-headline text-3xl font-bold">Need Help?</h2>
                     <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                        If you encounter an issue or feel unsafe during an experience, please contact our support team immediately. We are here to help.
                     </p>
                      <Button asChild className="mt-6">
                        <Link href="/contact">Contact Support</Link>
                      </Button>
                </div>

            </div>
        </div>
    );
}
