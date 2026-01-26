'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const popularDestinations = [
  { id: 'dest-paris', name: 'Paris', imageId: 'dest-paris' },
  { id: 'dest-rome', name: 'Rome', imageId: 'dest-rome' },
  { id: 'dest-barcelona', name: 'Barcelona', imageId: 'dest-barcelona' },
  { id: 'dest-new-york', name: 'New York', imageId: 'dest-new-york' },
  { id: 'dest-san-francisco', name: 'San Francisco', imageId: 'dest-san-francisco' },
  { id: 'dest-london', name: 'London', imageId: 'dest-london' },
  { id: 'dest-lisbon', name: 'Lisbon', imageId: 'dest-lisbon' },
  { id: 'dest-amsterdam', name: 'Amsterdam', imageId: 'dest-amsterdam' },
];

export function PopularDestinationsSection() {
    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Popular Destinations</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">Explore vibrant cultures and unforgettable meals in these top-rated cities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {popularDestinations.map(dest => {
                    const destImage = PlaceHolderImages.find(p => p.id === dest.imageId);
                    return (
                        <Link key={dest.id} href={`/discover?city=${dest.name}`} className="group block">
                            <Card className="overflow-hidden relative h-80 rounded-lg">
                                {destImage && (
                                    <Image
                                        src={destImage.imageUrl}
                                        alt={dest.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={destImage.imageHint}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="font-headline text-2xl font-bold">
                                        {dest.name}
                                    </h3>
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </section>
    );
}
