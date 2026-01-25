'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Sponsor } from '@/lib/types';

export function FeaturedSponsorsSection() {
    const firestore = useFirestore();

    const sponsorsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'sponsors'), where('isActive', '==', true)) : null,
        [firestore]
    );
    const { data: sponsors, isLoading } = useCollection<Sponsor>(sponsorsQuery);

    if (isLoading || !sponsors || sponsors.length === 0) {
        return null; // Don't render the section if there are no active sponsors or it's loading
    }

    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Our Partners</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">We're proud to be supported by these amazing organizations.</p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-center">
            {sponsors.map(sponsor => (
                <Link key={sponsor.id} href={sponsor.website || '#'} target="_blank" rel="noopener noreferrer" className="group" title={sponsor.name}>
                    <div className="relative h-20 grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
                        <Image
                            src={sponsor.logoUrl}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                            sizes="150px"
                        />
                    </div>
                </Link>
            ))}
            </div>
        </section>
    );
}
