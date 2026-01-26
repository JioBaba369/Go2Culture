'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Check, X, ShieldCheck, MessageCircle, Heart, Utensils, Calendar, Users, Ban, Home, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

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
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
  const [agreedToResponsibilities, setAgreedToResponsibilities] = useState(false);

  const allAgreed = agreedToContract && agreedToGuidelines && agreedToResponsibilities;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Host Contract & Community Guidelines</h1>
        <p className="text-muted-foreground">
          To ensure a safe, trustworthy, and high-quality community, all hosts are required to agree to the following terms.
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
            <CardDescription>Please review and check each item to confirm your agreement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-md">
                <Checkbox id="agree-contract" checked={agreedToContract} onCheckedChange={(c) => setAgreedToContract(c as boolean)} />
                <Label htmlFor="agree-contract" className="flex-1 cursor-pointer">
                    I have read, understood, and agree to abide by the Host Do's and Don'ts outlined above.
                </Label>
            </div>
             <div className="flex items-center space-x-3 p-4 border rounded-md">
                <Checkbox id="agree-guidelines" checked={agreedToGuidelines} onCheckedChange={(c) => setAgreedToGuidelines(c as boolean)} />
                 <Label htmlFor="agree-guidelines" className="flex-1 cursor-pointer">
                    I will follow the full <Link href="/host-guidelines" className="text-primary underline">Host Guidelines</Link> and <Link href="/terms" className="text-primary underline">Terms of Service</Link>.
                </Label>
            </div>
             <div className="flex items-center space-x-3 p-4 border rounded-md">
                <Checkbox id="agree-responsibilities" checked={agreedToResponsibilities} onCheckedChange={(c) => setAgreedToResponsibilities(c as boolean)} />
                 <Label htmlFor="agree-responsibilities" className="flex-1 cursor-pointer">
                    I acknowledge my responsibility for food safety, local laws, and providing a safe experience for my guests.
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" disabled={!allAgreed}>
            Accept & Continue
        </Button>
      </div>

    </div>
  );
}
