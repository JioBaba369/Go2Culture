
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, MapPin, Code } from 'lucide-react';
import Link from 'next/link';

const openPositions = [
    {
        title: 'Senior Frontend Engineer',
        department: 'Engineering',
        location: 'Remote (Global)',
        icon: Code
    },
    {
        title: 'Community Manager',
        department: 'Marketing',
        location: 'Sydney, Australia',
        icon: Briefcase
    },
    {
        title: 'Host Trust & Safety Specialist',
        department: 'Operations',
        location: 'Remote (EU Timezones)',
        icon: MapPin
    },
];

export default function CareersPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Work With Us</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Join our mission to connect the world through food and culture. We're a passionate, remote-first team looking for talented people to help us grow.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="font-headline text-3xl font-bold">Open Positions</h2>
                <div className="mt-6 space-y-4">
                    {openPositions.map((position) => (
                        <Card key={position.title}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{position.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-2"><position.icon className="h-4 w-4" /> {position.department}</span>
                                        <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {position.location}</span>
                                    </CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href={`/contact?subject=Application for ${encodeURIComponent(position.title)}`}>Apply Now</Link>
                                </Button>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                 <div className="text-center mt-12 bg-card p-8 rounded-lg">
                    <h3 className="font-headline text-2xl font-bold">Don't see your role?</h3>
                    <p className="mt-2 text-muted-foreground">We're always looking for great talent. Send us your resume and tell us how you can make a difference at Go2Culture.</p>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
