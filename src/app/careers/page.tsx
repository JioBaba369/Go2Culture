
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, MapPin, Code, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Job } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ElementType> = {
    Engineering: Code,
    Marketing: Briefcase,
    Operations: Briefcase,
    Default: Briefcase,
};

export default function CareersPage() {
    const firestore = useFirestore();
    const jobsQuery = useMemoFirebase(
        () => firestore ? query(collection(firestore, 'jobs'), where('isActive', '==', true)) : null,
        [firestore]
    );
    const { data: openPositions, isLoading } = useCollection<Job>(jobsQuery);

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Join Our Team</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Help us on our mission to connect the world through food and culture. We're a passionate, remote-first team looking for talented people to help us build something special.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="font-headline text-3xl font-bold">Current Openings</h2>
                <div className="mt-6 space-y-4">
                    {isLoading && (
                        <>
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </>
                    )}
                    {!isLoading && openPositions && openPositions.length > 0 ? (
                        openPositions.map((position) => {
                            const Icon = iconMap[position.department] || iconMap.Default;
                            return (
                                <Card key={position.id}>
                                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex-grow">
                                            <CardTitle className="text-xl">{position.title}</CardTitle>
                                            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-2">
                                                <span className="flex items-center gap-2"><Icon className="h-4 w-4" /> {position.department}</span>
                                                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {position.location}</span>
                                            </CardDescription>
                                        </div>
                                        <Button asChild className="w-full md:w-auto">
                                            <Link href={`/contact?subject=Application for ${encodeURIComponent(position.title)}`}>Apply Now</Link>
                                        </Button>
                                    </CardHeader>
                                </Card>
                            );
                        })
                    ) : (
                        !isLoading && (
                            <Card className="text-center py-12">
                                <p className="text-muted-foreground">There are no open positions at this time. Please check back later!</p>
                            </Card>
                        )
                    )}
                </div>
                 <div className="text-center mt-12 bg-card p-8 rounded-lg">
                    <h3 className="font-headline text-2xl font-bold">Don't See the Right Fit?</h3>
                    <p className="mt-2 text-muted-foreground">We're always looking for talented, passionate people. Send us your resume and tell us how you could make a difference at Go2Culture.</p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/contact?subject=General Application">Contact Us</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
