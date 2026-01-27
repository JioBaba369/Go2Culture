
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Host } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function HostContractPage() {
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();

  const hostRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid, 'hosts', user.uid) : null),
    [user, firestore]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);
  
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [agreedToInsurance, setAgreedToInsurance] = useState(false);
  const [agreedToRegulations, setAgreedToRegulations] = useState(false);
  const [agreedToIndependentStatus, setAgreedToIndependentStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const alreadyAgreed = host?.compliance?.contractAccepted && host?.compliance?.insurancePolicyAccepted && host?.compliance?.understandsFoodRegulations && host?.compliance?.acceptsIndependentHostStatus;

  useEffect(() => {
    if (host?.compliance) {
        setAgreedToContract(host.compliance.contractAccepted || false);
        setAgreedToInsurance(host.compliance.insurancePolicyAccepted || false);
        setAgreedToRegulations(host.compliance.understandsFoodRegulations || false);
        setAgreedToIndependentStatus(host.compliance.acceptsIndependentHostStatus || false);
    }
  }, [host]);

  const allAgreed = agreedToContract && agreedToInsurance && agreedToRegulations && agreedToIndependentStatus;

  const handleAccept = async () => {
    if (!hostRef) return;
    setIsSubmitting(true);
    try {
        await updateDoc(hostRef, {
            'compliance.contractAccepted': true,
            'compliance.insurancePolicyAccepted': true,
            'compliance.understandsFoodRegulations': true,
            'compliance.acceptsIndependentHostStatus': true,
        });
        toast({ title: "Agreement Saved", description: "Thank you for confirming your host responsibilities." });
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
                  <CardContent className="space-y-4">
                      <Skeleton className="h-12 w-full" />
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
        <h1 className="text-3xl font-headline font-bold">Host Agreement</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          To ensure a safe, legal, and transparent community, all hosts are required to review and accept our service agreement and liability declarations. This is a one-time requirement.
        </p>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Agreement Checklist</CardTitle>
            <CardDescription>Please review the full documents and check each item to confirm your agreement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-contract" checked={agreedToContract} onCheckedChange={(c) => setAgreedToContract(c as boolean)} disabled={alreadyAgreed} />
                <Label htmlFor="agree-contract" className="flex-1 cursor-pointer">
                    I have read, understood, and agree to the <Link href="/host-guidelines" className="text-primary underline hover:text-primary/80">Host Service Agreement</Link>, which covers my responsibilities, payment terms, and our platform's role as a marketplace.
                </Label>
            </div>
             <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-insurance" checked={agreedToInsurance} onCheckedChange={(c) => setAgreedToInsurance(c as boolean)} disabled={alreadyAgreed} />
                 <Label htmlFor="agree-insurance" className="flex-1 cursor-pointer">
                    I acknowledge and agree to the platform's <Link href="/trust-and-safety" className="text-primary underline hover:text-primary/80">Insurance Framework</Link>. I confirm that I am responsible for maintaining my own adequate public liability and other relevant insurance for my hosting activities.
                </Label>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-regulations" checked={agreedToRegulations} onCheckedChange={(c) => setAgreedToRegulations(c as boolean)} disabled={alreadyAgreed} />
                <Label htmlFor="agree-regulations" className="flex-1 cursor-pointer">
                    I confirm that I understand and will comply with all local laws and food safety regulations applicable to my hosting activities in Australia.
                </Label>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-status" checked={agreedToIndependentStatus} onCheckedChange={(c) => setAgreedToIndependentStatus(c as boolean)} disabled={alreadyAgreed} />
                <Label htmlFor="agree-status" className="flex-1 cursor-pointer">
                    I understand that I am an independent host, not an employee or partner of Go2Culture, and I am solely responsible for my own taxes and legal obligations.
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!allAgreed || isSubmitting || alreadyAgreed} onClick={handleAccept}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {alreadyAgreed ? <><Check className="mr-2 h-4 w-4" />Agreements Accepted</> : 'Accept All & Continue'}
        </Button>
      </div>

    </div>
  );
}

    