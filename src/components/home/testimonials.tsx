
'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TestimonialCard } from '@/components/testimonial-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query, orderBy } from 'firebase/firestore';
import { Review } from '@/lib/types';

export function TestimonialsSection() {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'), limit(3)) : null,
        [firestore]
    );
    const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsQuery);

    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What Our Community is Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-7xl mx-auto">
            {areReviewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-full">
                    <CardContent className="p-6">
                    <div className="flex mb-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-5" />)}</div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-4" />
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    </CardContent>
                </Card>
                ))
            ) : (
                reviews?.map(review => (
                <TestimonialCard key={review.id} review={review} />
                ))
            )}
            </div>
        </section>
    );
}

    
