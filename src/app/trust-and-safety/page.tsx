
import { ShieldCheck, MessageCircle, Lock, UserCheck, Search, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
                     <div className="flex flex-col items-center text-center">
                        <UserCheck className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold font-headline">Host & Guest Verification</h3>
                        <p className="text-muted-foreground mt-2">We verify hosts through government ID and selfie checks. Guests also provide information to build a trusted community profile.</p>
                    </div>
                     <div className="flex flex-col items-center text-center">
                        <Lock className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold font-headline">Secure Payments</h3>
                        <p className="text-muted-foreground mt-2">Our platform handles all transactions securely. Hosts are paid after the experience is completed, and guests are protected.</p>
                    </div>
                     <div className="flex flex-col items-center text-center">
                        <MessageCircle className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold font-headline">Secure Messaging</h3>
                        <p className="text-muted-foreground mt-2">Communicate with your host or guest through our platform before your experience. Your contact details remain private until a booking is confirmed.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Search className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold font-headline">Smart Reviews</h3>
                        <p className="text-muted-foreground mt-2">Our two-way review system ensures that both hosts and guests can share their feedback honestly, helping everyone make informed decisions.</p>
                    </div>
                </div>

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

                <div className="text-center pt-8">
                    <h2 className="font-headline text-3xl font-bold">Our Commitment</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        We are continuously working to make our platform safer. From data privacy to community education, our goal is to create a space where everyone feels welcome and secure.
                    </p>
                </div>
            </div>
        </div>
    );
}
