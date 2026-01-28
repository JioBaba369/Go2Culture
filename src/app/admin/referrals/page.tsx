
'use client';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { User, ReferredUser } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useDoc } from '@/firebase/firestore/use-doc';
import { ADMIN_UID } from '@/lib/auth';
import { Gift, Users, Wallet } from 'lucide-react';
import Link from 'next/link';

function ReferralSummary({ users, isLoading }: { users: User[] | null, isLoading: boolean }) {
  const summary = useMemo(() => {
    if (!users) return { totalReferrals: 0, totalCreditAwarded: 0 };

    const totalReferrals = users.length;
    const totalCreditAwarded = users.reduce((sum, user) => sum + (user.referralCredit || 0), 0);

    return { totalReferrals, totalCreditAwarded };
  }, [users]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalReferrals}</div>
          <p className="text-xs text-muted-foreground">Successful new user sign-ups.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Credit Awarded</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summary.totalCreditAwarded.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Paid out to referrers.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Offer</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Give $10, Get $10</div>
          <p className="text-xs text-muted-foreground">After first experience is completed.</p>
        </CardContent>
      </Card>
    </div>
  )
}


function ReferralRow({ referredUser }: { referredUser: ReferredUser }) {
  const firestore = useFirestore();

  const referrerRef = useMemoFirebase(
    () => (firestore && referredUser.referredBy ? doc(firestore, 'users', referredUser.referredBy) : null),
    [firestore, referredUser.referredBy]
  );
  const { data: referrer, isLoading: isReferrerLoading } = useDoc<User>(referrerRef);

  if (isReferrerLoading || !referredUser) {
    return (
      <TableRow>
        <TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell>
      </TableRow>
    );
  }
  
  const referredUserImage = PlaceHolderImages.find(p => p.id === referredUser.profilePhotoId);
  const referrerImage = referrer ? PlaceHolderImages.find(p => p.id === referrer.profilePhotoId) : null;

  return (
    <TableRow>
      <TableCell>
        <Link href={`/admin/users/${referrer?.id}/edit`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-9 w-9">
            {referrerImage && <AvatarImage src={referrerImage.imageUrl} alt={referrer?.fullName} />}
            <AvatarFallback>{referrer?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{referrer?.fullName}</div>
            <div className="text-xs text-muted-foreground">{referrer?.email}</div>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/admin/users/${referredUser.id}/edit`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-9 w-9">
            {referredUserImage && <AvatarImage src={referredUserImage.imageUrl} alt={referredUser.fullName} />}
            <AvatarFallback>{referredUser.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
           <div>
            <div className="font-medium">{referredUser.fullName}</div>
            <div className="text-xs text-muted-foreground">{referredUser.email}</div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right">
        {referredUser.createdAt?.toDate ? format(referredUser.createdAt.toDate(), 'PPP') : 'N/A'}
      </TableCell>
    </TableRow>
  )
}

function ReferralCardMobile({ referredUser }: { referredUser: ReferredUser }) {
  const firestore = useFirestore();

  const referrerRef = useMemoFirebase(
    () => (firestore && referredUser.referredBy ? doc(firestore, 'users', referredUser.referredBy) : null),
    [firestore, referredUser.referredBy]
  );
  const { data: referrer, isLoading: isReferrerLoading } = useDoc<User>(referrerRef);
  
  if (isReferrerLoading || !referredUser || !referrer) {
      return <Skeleton className="h-28 w-full" />;
  }
  
  const referredUserImage = PlaceHolderImages.find(p => p.id === referredUser.profilePhotoId);
  const referrerImage = PlaceHolderImages.find(p => p.id === referrer.profilePhotoId);
  
  return (
      <Card>
          <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-16">Referred:</span>
                  <Link href={`/admin/users/${referredUser.id}/edit`} className="flex items-center gap-3 hover:underline">
                      <Avatar className="h-8 w-8">
                          {referredUserImage && <AvatarImage src={referredUserImage.imageUrl} alt={referredUser.fullName} />}
                          <AvatarFallback>{referredUser.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{referredUser.fullName}</span>
                  </Link>
              </div>
              <div className="flex items-center gap-3">
                   <span className="text-xs font-semibold text-muted-foreground w-16">By:</span>
                   <Link href={`/admin/users/${referrer.id}/edit`} className="flex items-center gap-3 hover:underline">
                      <Avatar className="h-8 w-8">
                          {referrerImage && <AvatarImage src={referrerImage.imageUrl} alt={referrer.fullName} />}
                          <AvatarFallback>{referrer.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{referrer.fullName}</span>
                  </Link>
              </div>
          </CardContent>
          <CardHeader className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-right">Joined on {referredUser.createdAt?.toDate ? format(referredUser.createdAt.toDate(), 'PPP') : 'N/A'}</p>
          </CardHeader>
      </Card>
  )
}

export default function AdminReferralsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.uid === ADMIN_UID;

  const referredUsersQuery = useMemoFirebase(
    () => (firestore && isAdmin ? query(collection(firestore, 'users'), where('referredBy', '!=', null)) : null),
    [firestore, isAdmin]
  );
  const { data: referredUsers, isLoading } = useCollection<User>(referredUsersQuery);

  const finalIsLoading = isUserLoading || isLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Referrals</h1>
        <p className="text-muted-foreground">
          Track users who have joined Go2Culture through referrals.
        </p>
      </div>

      <ReferralSummary users={referredUsers} isLoading={finalIsLoading} />
      
       {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
             {finalIsLoading ? (
                Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
            ) : referredUsers && referredUsers.length > 0 ? (
                referredUsers.map(user => <ReferralCardMobile key={user.id} referredUser={user} />)
            ) : (
                <Card className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">No referrals found.</p>
                </Card>
            )}
        </div>


      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            A list of all users who signed up via a referral link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referred By</TableHead>
                <TableHead>New User (Referred)</TableHead>
                <TableHead className="text-right">Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finalIsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : referredUsers && referredUsers.length > 0 ? (
                referredUsers.map((user) => <ReferralRow key={user.id} referredUser={user} />)
              ) : (
                 <TableRow>
                   <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                     No referrals found.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
