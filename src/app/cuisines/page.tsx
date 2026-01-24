
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Experience } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils, Brush, Music, Landmark } from 'lucide-react';


const categoryDetails: Record<string, { icon: React.ElementType, imageURL: string }> = {
    'In-Home Dining': { icon: Utensils, imageURL: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwYXN0YSUyMGRpc2h8ZW58MHx8fHwxNzY5MDE4NDE3fDA&ixlib=rb-4.1.0&q=80&w=1080' },
    'Cooking Class': { icon: Utensils, imageURL: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdXJyeXxlbnwwfHx8fDE3Njk2NjE0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    'Art & Craft': { icon: Brush, imageURL: 'https://images.unsplash.com/photo-1558239304-a28f7a61c5c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwb3R0ZXJ5fGVufDB8fHx8fDE3NzAyODQ4NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    'Music & Dance': { icon: Music, imageURL: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhcnxlbnwwfHx8fDE3NzAyODQ5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    'History & Walks': { icon: Landmark, imageURL: 'https://images.unsplash.com/photo-1504109586047-9f572a1a2434?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxoaXN0b3J5JTIwd2Fsa3xlbnwwfHx8fDE3NzAyODQ5NDB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    'Restaurant Experience': { icon: Utensils, imageURL: 'https://images.unsplash.com/photo-1628045339331-524a2f8938a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmcmVuY2glMjBmb29kfGVufDB8fHx8fDE3Njk2NjE0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    'Special Event': { icon: Utensils, imageURL: 'https://images.unsplash.com/photo-1629894344418-76a087037a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW9yaSUyMGhhbmdpJTIwZm9vZHxlbnwwfHx8fDE3Njk2NjE1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
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
                        
                        return (
                            <Link key={category} href={`/discover?category=${encodeURIComponent(category)}`} className="group block">
                                <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                    <div className="relative h-64 w-full">
                                        {details?.imageURL ? (
                                            <Image
                                                src={details.imageURL}
                                                alt={category}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

    