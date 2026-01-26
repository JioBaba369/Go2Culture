
'use client';

import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Sponsor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function SponsorsPage() {
    const firestore = useFirestore();
    const sponsorsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'sponsors'), where('isActive', '==', true)) : null,
        [firestore]
    );
    const { data: sponsors, isLoading } = useCollection<Sponsor>(sponsorsQuery);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Sponsors & Partners</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    We're proud to partner with organizations that share our passion for authentic cultural exchange and community building.
                </p>
            </div>

            <div className="max-w-5xl mx-auto mt-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {isLoading && Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex flex-col items-center justify-center p-6 text-center h-48">
                            <Skeleton className="h-16 w-16 rounded-full mb-4" />
                            <Skeleton className="h-6 w-3/4" />
                        </Card>
                    ))}
                    {sponsors && sponsors.map((sponsor) => (
                        <Link key={sponsor.id} href={sponsor.website || '#'} target="_blank" rel="noopener noreferrer" className="group">
                            <Card className="flex flex-col items-center justify-center p-6 text-center transition-shadow hover:shadow-lg h-full">
                                <div className="relative h-24 w-24 mb-4">
                                    <Image
                                        src={sponsor.logoUrl}
                                        alt={`${sponsor.name} logo`}
                                        fill
                                        className="object-contain"
                                        sizes="96px"
                                    />
                                </div>
                                <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                            </Card>
                        </Link>
                    ))}
                </div>
                 {!isLoading && sponsors?.length === 0 && (
                    <div className="text-center text-muted-foreground py-16">
                        <p>We are currently seeking new partners. Contact us to learn more.</p>
                    </div>
                )}
            </div>
             <div className="text-center mt-16 bg-card p-8 rounded-lg max-w-4xl mx-auto">
                <h3 className="font-headline text-2xl font-bold">Become a Partner</h3>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                    Interested in supporting our mission? We'd love to hear from you. Reach out to our partnerships team to explore how we can work together.
                </p>
                <a href="mailto:partnerships@go2culture.com" className="inline-block mt-4 text-primary hover:underline">
                    partnerships@go2culture.com
                </a>
            </div>
        </div>
    );
}
