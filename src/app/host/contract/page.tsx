
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, X, ShieldCheck, MessageCircle, Heart, Utensils, Calendar, Users, Ban, Home, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Host } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const dos = [
  { icon: Heart, title: "Be Authentic & Welcoming", description: "Share your culture genuinely. Treat all guests with respect and warmth, regardless of their background." },
  { icon: MessageCircle, title: "Communicate Promptly", description: "Respond to inquiries and booking requests in a timely manner. Clear communication is key to a great experience." },
  { icon: Home, title: "Maintain a Clean & Safe Space", description: "Ensure your home is hygienic and free of hazards. Your guest's comfort and safety are paramount." },
  { icon: Utensils, title: "Represent Your Experience Accurately", description: "Your listing, photos, and menu should honestly reflect what guests will experience." },
  { icon: Calendar, title: "Honor Your Commitments", description: "Avoid cancellations. When you confirm a booking, you are committing to your guest's plans." },
];

const donts = [
  { icon: Ban, title: "Discriminate or Harass", description: "Go2Culture has a zero-tolerance policy for discrimination, harassment, or hate speech of any kind." },
  { icon: X, title: "Misrepresent Your Offering", description: "Do not offer services, food, or an environment that differs significantly from your listing." },
  { icon: Calendar, title: "Cancel Unnecessarily", description: "Avoid last-minute cancellations except in clear emergencies. This severely impacts guest trust." },
  { icon: ExternalLink, title: "Take Business Off-Platform", description: "All communications and payments must be processed through Go2Culture to ensure security for both parties." },
  { icon: ShieldCheck, title: "Provide an Unsafe Environment", description: "Do not host if your home is unsafe, or offer any illegal substances or activities." },
];

export default function HostContractPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const hostRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'hosts', user.uid) : null),
    [user, firestore]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);
  
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [agreedToResponsibilities, setAgreedToResponsibilities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAgreed = agreedToContract && agreedToGuidelines && agreedToResponsibilities;
  const alreadyAgreed = host?.compliance?.contractAccepted && host?.compliance?.guidelinesAccepted && host?.compliance?.responsibilitiesAccepted;

  useEffect(() => {
    if (host?.compliance) {
        setAgreedToContract(host.compliance.contractAccepted || false);
        setAgreedToGuidelines(host.compliance.guidelinesAccepted || false);
        setAgreedToResponsibilities(host.compliance.responsibilitiesAccepted || false);
    }
  }, [host]);

  const handleAccept = async () => {
    if (!hostRef) return;
    setIsSubmitting(true);
    try {
        await updateDoc(hostRef, {
            'compliance.contractAccepted': true,
            'compliance.guidelinesAccepted': true,
            'compliance.responsibilitiesAccepted': true,
        });
        toast({ title: "Agreement Saved", description: "Thank you for confirming the host guidelines." });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: "Could not save your agreement. Please try again." });
    } finally {
        setIsSubmitting(false);
    }
  }

  const isLoading = isUserLoading || isHostLoading;

  if (isLoading) {
      return (
          <div className="space-y-8">
              <div className="space-y-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-8">
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-64 w-full" />
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                  <CardContent className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Host Contract & Community Guidelines</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Our community is built on trust. To ensure a safe, reliable, and respectful experience for everyone, all hosts are required to read and agree to the following standards. This agreement is a one-time requirement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Principles</CardTitle>
          <CardDescription>Our community is built on these foundational values.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-headline text-2xl font-semibold flex items-center text-green-600 mb-4">
              <Check className="mr-2" /> The Do's
            </h3>
            <div className="space-y-6">
              {dos.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <item.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
           <div>
            <h3 className="font-headline text-2xl font-semibold flex items-center text-destructive mb-4">
              <X className="mr-2" /> The Don'ts
            </h3>
            <div className="space-y-6">
              {donts.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <item.icon className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Host Agreement & Checklist</CardTitle>
            <CardDescription>Please review and check each item to confirm your agreement. This is required to continue hosting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-contract" checked={agreedToContract} onCheckedChange={(c) => setAgreedToContract(c as boolean)} disabled={alreadyAgreed} />
                <Label htmlFor="agree-contract" className="flex-1 cursor-pointer">
                    I have read, understood, and agree to abide by the Host Do's and Don'ts outlined above.
                </Label>
            </div>
             <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-guidelines" checked={agreedToGuidelines} onCheckedChange={(c) => setAgreedToGuidelines(c as boolean)} disabled={alreadyAgreed} />
                 <Label htmlFor="agree-guidelines" className="flex-1 cursor-pointer">
                    I will follow the full <Link href="/host-guidelines" className="text-primary underline hover:text-primary/80">Host Guidelines</Link> and <Link href="/terms" className="text-primary underline hover:text-primary/80">Terms of Service</Link>.
                </Label>
            </div>
             <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-responsibilities" checked={agreedToResponsibilities} onCheckedChange={(c) => setAgreedToResponsibilities(c as boolean)} disabled={alreadyAgreed} />
                 <Label htmlFor="agree-responsibilities" className="flex-1 cursor-pointer">
                    I acknowledge my responsibility for food safety, local laws, and providing a safe experience for my guests.
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!allAgreed || isSubmitting || alreadyAgreed} onClick={handleAccept}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {alreadyAgreed ? 'Agreement Accepted' : 'Accept & Continue'}
        </Button>
      </div>

    </div>
  );
}
