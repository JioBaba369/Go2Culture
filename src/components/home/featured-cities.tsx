
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { suburbs } from '@/lib/location-data';

const cityImageMap: Record<string, string> = {
    SYD: 'city-sydney',
    MEL: 'city-melbourne',
    AKL: 'city-auckland',
    WLG: 'city-wellington',
    BRI: 'city-brisbane',
    PER: 'city-perth',
    ADL: 'city-adelaide',
    CBR: 'city-canberra',
    HBA: 'city-hobart',
    CHC: 'city-christchurch',
    ZQN: 'city-queenstown',
    HLZ: 'city-hamilton',
    TRG: 'city-tauranga',
}

export function FeaturedCitiesSection() {
    const featuredCities = useMemo(() => {
        const cityIds = ['SYD', 'MEL', 'AKL', 'WLG'];
        return suburbs.filter(s => cityIds.includes(s.id));
    }, []);

    // Assuming a loading state would be passed as a prop if this data were dynamic
    const isLoading = false; 

    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Featured Cities</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">Discover authentic experiences in our most popular destinations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
            ) : (
                featuredCities.map(city => {
                const cityImageId = cityImageMap[city.id];
                const cityImage = PlaceHolderImages.find(p => p.id === cityImageId);
                return (
                    <Link key={city.id} href={`/discover?suburb=${city.id}`} className="group block">
                    <Card className="overflow-hidden relative h-80 rounded-lg">
                        {cityImage && (
                        <Image
                            src={cityImage.imageUrl}
                            alt={city.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint={cityImage.imageHint}
                        />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white">
                        {city.name}
                        </h3>
                    </Card>
                    </Link>
                )
                })
            )}
            </div>
        </section>
    );
}
