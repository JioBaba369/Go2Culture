
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { suburbs } from '@/lib/location-data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Experience } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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


export default function CitiesPage() {
    const firestore = useFirestore();

    const { data: experiences, isLoading } = useCollection<Experience>(
        useMemoFirebase(() => firestore ? query(collection(firestore, 'experiences'), where('status', '==', 'live')) : null, [firestore])
    );
    
    const featuredCities = useMemo(() => {
        if (!experiences) return [];
        const citiesWithExperiences = [...new Set(experiences.map(e => e.location.suburb))];
        return suburbs.filter(s => citiesWithExperiences.includes(s.id));
    }, [experiences]);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Cities</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Find unique cultural dining experiences in cities around the globe.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-7xl mx-auto">
                {isLoading ? (
                    Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
                ) : (
                    featuredCities.map((city) => {
                        const imageURL = cityImageMap[city.id];
                        
                        return (
                            <Link key={city.id} href={`/discover?suburb=${city.id}`} className="group block">
                                <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                    <div className="relative h-80 w-full">
                                        {imageURL ? (
                                            <Image
                                                src={imageURL}
                                                alt={city.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="bg-muted h-full w-full flex items-center justify-center">
                                                <span className="text-muted-foreground">{city.name}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white">
                                            {city.name}
                                        </h3>
                                    </div>
                                </Card>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    );
}
