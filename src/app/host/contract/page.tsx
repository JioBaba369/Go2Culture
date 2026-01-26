
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, ShieldCheck, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const alreadyAgreed = host?.compliance?.contractAccepted;

  useEffect(() => {
    if (host?.compliance) {
        setAgreedToContract(host.compliance.contractAccepted || false);
        setAgreedToInsurance(host.compliance.contractAccepted || false); // If contract is accepted, assume insurance was too.
    }
  }, [host]);

  const allAgreed = agreedToContract && agreedToInsurance;

  const handleAccept = async () => {
    if (!hostRef) return;
    setIsSubmitting(true);
    try {
        await updateDoc(hostRef, {
            'compliance.contractAccepted': true,
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
          To ensure a safe and transparent community, all hosts are required to review and accept our service agreement. This is a one-time requirement.
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
                    I have read, understood, and agree to the <Link href="/host-guidelines" className="text-primary underline hover:text-primary/80">Host Service Agreement</Link>, which covers my responsibilities, payment terms, and liabilities.
                </Label>
            </div>
             <div className="flex items-start space-x-3 p-4 border rounded-md has-[:disabled]:opacity-70">
                <Checkbox id="agree-insurance" checked={agreedToInsurance} onCheckedChange={(c) => setAgreedToInsurance(c as boolean)} disabled={alreadyAgreed} />
                 <Label htmlFor="agree-insurance" className="flex-1 cursor-pointer">
                    I acknowledge and agree to the platform's <Link href="/trust-and-safety" className="text-primary underline hover:text-primary/80">Insurance Framework</Link>, and I confirm that I am responsible for maintaining my own adequate insurance coverage.
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!allAgreed || isSubmitting || alreadyAgreed} onClick={handleAccept}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {alreadyAgreed ? <><Check className="mr-2 h-4 w-4" />Agreement Accepted</> : 'Accept & Continue'}
        </Button>
      </div>

    </div>
  );
}
