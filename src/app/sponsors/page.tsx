
import { Card } from '@/components/ui/card';
import Image from 'next/image';

const sponsors = [
    {
        name: 'Aussie Travel Co.',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'company logo',
    },
    {
        name: 'Kiwi Adventures',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'travel company logo',
    },
    {
        name: 'Global Foodies',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'food blog logo',
    },
    {
        name: 'CultureConnect',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'tech logo',
    },
     {
        name: 'Culinary Journeys Magazine',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'magazine logo',
    },
    {
        name: 'Taste of the World Foundation',
        logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dvfGVufDB8fHx8MTc3MDMwNzExNnww&ixlib=rb-4.1.0&q=80&w=1080',
        imageHint: 'foundation logo',
    },
];

export default function SponsorsPage() {
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
                    {sponsors.map((sponsor) => (
                        <Card key={sponsor.name} className="flex flex-col items-center justify-center p-6 text-center transition-shadow hover:shadow-lg">
                            <div className="relative h-24 w-24 mb-4">
                                <Image
                                    src={sponsor.logoUrl}
                                    alt={`${sponsor.name} logo`}
                                    fill
                                    className="object-contain"
                                    sizes="96px"
                                    data-ai-hint={sponsor.imageHint}
                                />
                            </div>
                            <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                        </Card>
                    ))}
                </div>
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
