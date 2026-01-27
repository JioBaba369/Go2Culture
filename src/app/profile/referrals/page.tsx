
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFirebase, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { User, ReferredUser } from '@/lib/types';
import { Facebook, Twitter, Mail, Copy, Share2, Wallet, Users, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { format } from 'date-fns';

const statusMap: Record<ReferredUser['status'], { text: string; className: string }> = {
    joined: { text: 'Joined', className: 'text-blue-500' },
    booking_completed: { text: 'First Experience Complete', className: 'text-orange-500' },
    credit_awarded: { text: 'Credit Awarded', className: 'text-green-500 font-semibold' },
};


function ReferredUserRow({ referredUser }: { referredUser: ReferredUser }) {
    const { firestore } = useFirebase();
    const userProfileRef = useMemoFirebase(() => (firestore ? doc(firestore, 'users', referredUser.id) : null), [firestore, referredUser.id]);
    const { data: userProfile, isLoading } = useDoc<User>(userProfileRef);

    const userImage = PlaceHolderImages.find(p => p.id === userProfile?.profilePhotoId);
    
    if (isLoading) {
        return <TableRow><TableCell colSpan={3}><Skeleton className="h-10" /></TableCell></TableRow>
    }

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {userImage && <AvatarImage src={userImage.imageUrl} alt={referredUser.fullName} />}
                        <AvatarFallback>{referredUser.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{referredUser.fullName}</span>
                </div>
            </TableCell>
            <TableCell>
                <span className={statusMap[referredUser.status].className}>
                    {statusMap[referredUser.status].text}
                </span>
            </TableCell>
            <TableCell className="text-right">
                {referredUser.createdAt.toDate ? format(referredUser.createdAt.toDate(), 'PPP') : 'N/A'}
            </TableCell>
        </TableRow>
    )
}

export default function ReferralsPage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
        [user, firestore]
    );
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);
    
    const referredUsersQuery = useMemoFirebase(
        () => (user && firestore ? query(collection(firestore, 'users', user.uid, 'referredUsers')) : null),
        [user, firestore]
    );
    const { data: referredUsers, isLoading: areReferredUsersLoading } = useCollection<ReferredUser>(referredUsersQuery);

    const referralCode = user ? user.uid.substring(0, 8).toUpperCase() : '';
    const referralLink = `https://go2culture.com/signup?ref=${referralCode}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        toast({ title: 'Copied!', description: 'Your referral link has been copied to your clipboard.' });
    }
    
    const isLoading = isUserLoading || isProfileLoading || areReferredUsersLoading;
    
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
                <h1 className="text-3xl font-headline font-bold">Invite a Friend, Share an Experience</h1>
                <p className="text-muted-foreground">Share the gift of culture. When your friend completes their first experience, you both get a $10 credit.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Referral Credit</CardTitle>
                        <CardDescription>Your available credit to use on future experiences.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold">${userProfile?.referralCredit || 0}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Invite someone who would value this.</CardTitle>
                        <CardDescription>
                            Give friends $10 off their first booking. After they attend, you'll get $10 credit.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input value={referralLink} readOnly className="font-mono text-sm"/>
                            <Button onClick={copyToClipboard} size="icon" variant="outline">
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" asChild>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            </Button>
                             <Button variant="outline" size="icon" asChild>
                                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Go2Culture! Use my link to get $10 off your first experience.`)}&url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                                <a href={`mailto:?subject=You're invited to Go2Culture!&body=${encodeURIComponent(`Hey! I use Go2Culture to find authentic food experiences. Join with my link to get $10 off your first booking: ${referralLink}`)}`} aria-label="Share via Email">
                                    <Mail className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                        <Share2 className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">Share Your Link</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Send your unique referral link to friends who you think would love Go2Culture.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                        <Gift className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">They Get $10</h3>
                    <p className="text-muted-foreground mt-2 text-sm">Your friend gets $10 off their first booking when they sign up using your link.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                         <Wallet className="h-6 w-6"/>
                    </div>
                    <h3 className="text-xl font-bold font-headline">You Get $10</h3>
                    <p className="text-muted-foreground mt-2 text-sm">After your friend completes their first experience, you receive $10 credit in your account.</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Your Referred Friends</CardTitle>
                    <CardDescription>Track the status of your referrals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Friend</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Date Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referredUsers && referredUsers.length > 0 ? (
                                referredUsers.map(ru => <ReferredUserRow key={ru.id} referredUser={ru} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        Your referred friends will appear here once they sign up.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
     