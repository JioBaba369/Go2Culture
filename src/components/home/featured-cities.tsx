
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { suburbs } from '@/lib/location-data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Experience } from '@/lib/types';

const cityImageMap: Record<string, string> = {
    SYD: 'https://images.unsplash.com/photo-1524293581274-7540a2d487b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzeWRuZXl8ZW58MHx8fHwxNzY5MTczMTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    MEL: 'https://images.unsplash.com/photo-1545044846-351ba102b6d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtZWxib3VybmV8ZW58MHx8fHwxNzY5MTczMTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    AKL: 'https://images.unsplash.com/photo-1596140482099-a5c9e6f3d258?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhdWNrbGFuZHxlbnwwfHx8fDE3Njk2NTQzMjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    WLG: 'https://images.unsplash.com/photo-1589255863295-88a8c4c1387d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx3ZWxsaW5ndG9uJTIwbmV3JTIwemVhbGFuZHxlbnwwfHx8fDE3Njk2NTQzNTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    BRI: 'https://images.unsplash.com/photo-1608678224213-9a3c1555029e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxicmlzYmFuZXxlbnwwfHx8fDE3NzAyMDM3MDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    PER: 'https://images.unsplash.com/photo-1527914194462-84f579133b3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwZXJ0aCUyMGF1c3RyYWxpYXxlbnwwfHx8fDE3NzAyMDM3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ADL: 'https://images.unsplash.com/photo-1596814234509-30c11f7f9829?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhZGVsYWlkZXxlbnwwfHx8fDE3NzAyMDM3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    CBR: 'https://images.unsplash.com/photo-1596700683057-08d745a76985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYW5iZXJyYXxlbnwwfHx8fDE3NzAyMDM3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    HBA: 'https://images.unsplash.com/photo-1627931327154-15db53046f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxob2JhcnR8ZW58MHx8fHwxNzAyMDM4MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    CHC: 'https://images.unsplash.com/photo-1582298539294-046604149b5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjaHJpc3RjaHVyY2glMjBuZXclMjB6ZWFsYW5kfGVufDB8fHx8fDE3NzAyMDM4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ZQN: 'https://images.unsplash.com/photo-1509233682915-d3a7c793a38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxxdWVlbnN0b3dufGVufDB8fHx8fDE3NzAyMDM4ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    HLZ: 'https://images.unsplash.com/photo-1590497003437-14a82a8a5c37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxoYW1pbHRvbiUyMG5ldyUyMHplYWxhbmR8ZW58MHx8fHwxNzAyMDM5MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    TRG: 'https://images.unsplash.com/photo-1620247690323-8b77053e1634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0YXVyYW5nYSUyMG5ldyUyMHplYWxhbmR8ZW58MHx8fHwxNzAyMDM5NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
}

export function FeaturedCitiesSection() {
    const firestore = useFirestore();
    const experiencesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'experiences'), where('status', '==', 'live')) : null,
        [firestore]
    );
    const { data: experiences, isLoading } = useCollection<Experience>(experiencesQuery);
    
    const featuredCitiesData = useMemo(() => {
        if (!experiences) return { cities: [], counts: {} };

        const cityCounts = experiences.reduce((acc, exp) => {
            const suburbId = exp.location.suburb;
            if (suburbId) {
                acc[suburbId] = (acc[suburbId] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const sortedCityIds = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        const top4CityIds = sortedCityIds.slice(0, 4);

        const cities = suburbs.filter(s => top4CityIds.includes(s.id))
            .sort((a, b) => top4CityIds.indexOf(a.id) - top4CityIds.indexOf(b.id));
        
        return { cities, counts: cityCounts };

    }, [experiences]);

    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Explore Our Cities</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">Discover authentic experiences in our most popular destinations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
            ) : (
                featuredCitiesData.cities.map(city => {
                    const cityImageURL = cityImageMap[city.id];
                    const count = featuredCitiesData.counts[city.id] || 0;
                    return (
                        <Link key={city.id} href={`/discover?suburb=${city.id}`} className="group block">
                        <Card className="overflow-hidden relative h-80 rounded-lg">
                            {cityImageURL && (
                            <Image
                                src={cityImageURL}
                                alt={city.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="font-headline text-2xl font-bold">
                                {city.name}
                                </h3>
                                {count > 0 && <p className="text-sm font-medium">{count} {count > 1 ? 'experiences' : 'experience'}</p>}
                            </div>
                        </Card>
                        </Link>
                    )
                })
            )}
            </div>
        </section>
    );
}
