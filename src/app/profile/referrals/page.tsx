'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Facebook, Twitter, Mail, Copy, Share2, Wallet, Users, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// A simple hashing function to generate a pseudo-referral code for demonstration
const generateReferralCode = (uid: string) => {
    return uid.substring(0, 8).toUpperCase();
}

export default function ReferralsPage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
    
    const referralCode = user ? generateReferralCode(user.uid) : '...';
    const referralLink = `https://go2culture.com/signup?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        toast({ title: 'Copied!', description: 'Your referral code has been copied to your clipboard.' });
    }
    
    const isLoading = isUserLoading || isProfileLoading;
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Referrals & Credits</h1>
                <p className="text-muted-foreground">Share Go2Culture and earn credits for your next experience.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Credit</CardTitle>
                    <CardDescription>To use your credit, create a coupon and apply it at checkout.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-5xl font-bold">€{userProfile?.referralCredit || 0}</p>
                    <Button disabled>Create a Coupon</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Refer a Friend and Get €10 Off</CardTitle>
                    <CardDescription>
                        Give your friends €10 off an experience worth €90 or more. After they've attended, you'll receive €10 credit.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <Input value={referralCode} readOnly className="font-mono text-center sm:text-left"/>
                        <Button onClick={copyToClipboard} className="w-full sm:w-auto">
                            <Copy className="mr-2 h-4 w-4" /> Copy Code
                        </Button>
                    </div>
                     <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </Button>
                         <Button variant="outline" size="icon" asChild>
                            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Go2Culture! Use my code ${referralCode} to get €10 off your first experience.`)}&url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                            <a href={`mailto:?subject=You're invited to Go2Culture!&body=${encodeURIComponent(`Hey! I use Go2Culture to find authentic food experiences. Join with my code ${referralCode} to get €10 off your first booking of €90 or more. Check it out: ${referralLink}`)}`} aria-label="Share via Email">
                                <Mail className="h-5 w-5" />
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
             <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                        <Share2 className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">Share €10</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Share your personal code with friends (valid on a first booking over €90).</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                        <Gift className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">Get €10</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Receive €10 credit once your friends have attended their experience.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                         <Wallet className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">Go2Culture</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Use your referral credit on any Go2Culture experience worldwide!</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Referred Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                       You're awesome! Thanks to you, friends who use your code will appear here.
                    </p>
                </CardContent>
            </Card>

        </div>
    )
}
