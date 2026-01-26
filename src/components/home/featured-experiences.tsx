
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExperienceCard } from '@/components/experience-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query, where, orderBy } from 'firebase/firestore';
import { Experience } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedExperiencesSection() {
    const firestore = useFirestore();

    const experiencesQuery = useMemoFirebase(
        () => firestore ? query(
            collection(firestore, 'experiences'),
            where('status', '==', 'live'),
            orderBy('rating.average', 'desc'),
            limit(4)
        ) : null,
        [firestore]
    );
    const { data: experiences, isLoading } = useCollection<Experience>(experiencesQuery);

    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Featured Experiences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                ))
            ) : (
                experiences?.map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} />
                ))
            )}
            </div>
            <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
                <Link href="/discover">Explore All Experiences</Link>
            </Button>
            </div>
        </section>
    );
}
