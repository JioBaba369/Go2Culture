
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Experience } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, Brush, Music, Landmark } from 'lucide-react';


const categoryDetails: Record<string, { icon: React.ElementType, imageId: string }> = {
    'In-Home Dining': { icon: Utensils, imageId: 'cuisine-italian' },
    'Cooking Class': { icon: Utensils, imageId: 'exp-4-main' },
    'Art & Craft': { icon: Brush, imageId: 'exp-11-main' },
    'Music & Dance': { icon: Music, imageId: 'exp-12-main' },
    'History & Walks': { icon: Landmark, imageId: 'exp-13-main' },
    'Restaurant Experience': { icon: Utensils, imageId: 'exp-6-main' },
    'Special Event': { icon: Utensils, imageId: 'exp-7-main' },
}

export default function CategoriesPage() {
    const firestore = useFirestore();
    const { data: experiences, isLoading } = useCollection<Experience>(
        useMemoFirebase(() => firestore ? collection(firestore, 'experiences') : null, [firestore])
    );

    const allCategories = useMemo(() => {
        if (!experiences) return [];
        return [...new Set(experiences.map(e => e.category))]
    }, [experiences]);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore by Category</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    From food and art to music and history, find an experience that speaks to you.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12 max-w-7xl mx-auto">
                {isLoading ? (
                    Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                ) : (
                    allCategories.map((category) => {
                        const details = categoryDetails[category];
                        const image = details ? PlaceHolderImages.find(p => p.id === details.imageId) : null;
                        
                        return (
                            <Link key={category} href={`/discover?category=${encodeURIComponent(category)}`} className="group block">
                                <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                    <div className="relative h-64 w-full">
                                        {image ? (
                                            <Image
                                                src={image.imageUrl}
                                                alt={category}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                data-ai-hint={image.imageHint}
                                            />
                                        ) : (
                                            <div className="bg-muted h-full w-full flex items-center justify-center">
                                                <span className="text-muted-foreground">{category}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white flex items-center gap-2">
                                            {details?.icon && <details.icon className="h-6 w-6" />}
                                            {category}
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
