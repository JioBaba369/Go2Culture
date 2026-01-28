
'use client';

import React, { useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, where, documentId } from 'firebase/firestore';

import { Loader2 } from 'lucide-react';
import { WishlistItem, Experience } from '@/lib/types';
import { ExperienceCard } from '@/components/experience-card';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function WishlistPageContent() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();

  // 1. Fetch the user's wishlist item IDs
  const wishlistItemsQuery = useMemoFirebase(
    () => (user && firestore ? collection(firestore, 'users', user.uid, 'wishlist') : null),
    [user, firestore]
  );
  const { data: wishlistItems, isLoading: areWishlistItemsLoading } = useCollection<WishlistItem>(wishlistItemsQuery);

  // 2. Extract the experience IDs
  const experienceIds = useMemo(() => wishlistItems?.map(item => item.id) || [], [wishlistItems]);

  // 3. Fetch the full experience documents using the IDs, but only if they are 'live'
  const experiencesQuery = useMemoFirebase(() => {
    const validExperienceIds = experienceIds.filter(id => typeof id === 'string' && id.length > 0);

    if (!firestore || validExperienceIds.length === 0) {
      return null;
    }
    
    // Firestore 'in' queries are limited to 30 items per query.
    // Slicing to prevent crashes. A production app might need to chunk and merge multiple queries.
    return query(
      collection(firestore, 'experiences'), 
      where(documentId(), 'in', validExperienceIds.slice(0, 30)),
      where('status', '==', 'live') // This ensures we only fetch live experiences, respecting security rules.
    );
  }, [firestore, experienceIds]);

  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(experiencesQuery);
  
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?redirect=/profile/wishlist');
    }
  }, [isUserLoading, user, router]);

  const isLoading = isUserLoading || areWishlistItemsLoading || (wishlistItems && wishlistItems.length > 0 && areExperiencesLoading);

  if (isUserLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // or a message, but redirect will handle it
  }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-headline font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">The experiences you've saved for later.</p>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : experiences && experiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map(experience => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-12 h-80">
          <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">Looks like you haven't saved any experiences yet. Start exploring to find your next adventure!</p>
          <Button asChild className="mt-6">
            <Link href="/discover">Discover Experiences</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}


export default function WishlistPage() {
    return (
        <div>
            <WishlistPageContent />
        </div>
    );
}
