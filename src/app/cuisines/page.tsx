
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Experience } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';
import { getFlagEmoji } from '@/lib/format';

const cuisineImageMap: Record<string, string> = {
    'Italian': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxwYXN0YSUyMGRpc2h8ZW58MHx8fHwxNzY5MDE4NDE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'Mexican': 'https://images.unsplash.com/photo-1690874684451-92358e91b14c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx0YWNvJTIwcGxhdHRlcnxlbnwwfHx8fDE3NjkxMDgzMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Japanese': 'https://images.unsplash.com/photo-1588114652288-5178733355ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1lYWx8ZW58MHx8fHwxNzY5NjYxNDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdXJyeXxlbnwwfHx8fDE3Njk2NjE0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Thai': 'https://images.unsplash.com/photo-1569058242252-623df4609389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0aGFpJTIwY3Vycnl8ZW58MHx8fHwxNzY5MjIzNDU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'French': 'https://images.unsplash.com/photo-1628045339331-524a2f8938a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxmcmVuY2glMjBmb29kfGVufDB8fHx8fDE3Njk2NjE0NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'New Zealand': 'https://images.unsplash.com/photo-1629894344418-76a087037a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxtYW9yaSUyMGhhbmdpJTIwZm9vZHxlbnwwfHx8fDE3Njk2NjE1NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Vietnamese': 'https://images.unsplash.com/photo-1555126634-785b6b25c345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwaG98ZW58MHx8fHwxNzY5MjIzNTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'Lebanese': 'https://images.unsplash.com/photo-1615878343729-113495b18a1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsZWJhbmVzZSUyMGZvb2R8ZW58MHx8fHwxNzcwMTk3NjE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'Australian': 'https://images.unsplash.com/photo-1625535345783-c57659a85b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwcGxhdHRlcnxlbnwwfHx8fDE3NzAxOTc2NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
}

export default function CuisinesPage() {
    const firestore = useFirestore();
    const experiencesQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'experiences'), where('status', '==', 'live')) : null,
        [firestore]
    );
    const { data: experiences, isLoading } = useCollection<Experience>(experiencesQuery);

    const allCuisines = useMemo(() => {
        if (!experiences) return [];
        return [...new Set(experiences.map(e => e.menu.cuisine))].sort();
    }, [experiences]);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore by Cuisine</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    From spicy curries to delicate pastries, find a taste of the world.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12 max-w-7xl mx-auto">
                {isLoading ? (
                    Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                ) : (
                    allCuisines.map((cuisine) => {
                        const imageURL = cuisineImageMap[cuisine];
                        const emoji = getFlagEmoji(cuisine);
                        
                        return (
                            <Link key={cuisine} href={`/discover?cuisine=${encodeURIComponent(cuisine)}`} className="group block">
                                <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                    <div className="relative h-64 w-full">
                                        {imageURL ? (
                                            <Image
                                                src={imageURL}
                                                alt={cuisine}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="bg-muted h-full w-full flex items-center justify-center">
                                                <Utensils className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white flex items-center gap-2">
                                            {emoji}
                                            {cuisine}
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
