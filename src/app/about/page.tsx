
import { Users, Utensils, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
    const storyImage = PlaceHolderImages.find(p => p.id === 'exp-1-thumb-1');

    const philosophyItems = [
        {
            icon: Utensils,
            title: "Celebrate Authentic Heritage",
            description: "We celebrate the heart and soul of a culture through recipes passed from one generation to the next. It’s about sharing flavours, stories, and traditions you simply won't find in a restaurant."
        },
        {
            icon: Users,
            title: "Create Genuine Human Connection",
            description: "Opening a home to a guest is more than just a meal; it's an exchange that dissolves barriers. It’s a chance for hosts to share their story with pride and for guests to see a culture through new eyes."
        },
        {
            icon: DollarSign,
            title: "Empower Local Communities",
            description: "Every Go2Culture experience is a direct investment in a local family. It provides a meaningful source of income that honours their skills and strengthens the entire community."
        }
    ];

    return (
        <div className="py-12 md:py-16 space-y-16 md:space-y-24">

            {/* Hero Section */}
            <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-12 md:-mt-16 h-[50vh] flex items-center justify-center text-center text-white">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint={heroImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative p-4">
                    <h1 className="font-headline text-4xl md:text-6xl font-bold drop-shadow-lg">From Strangers to Friends</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto drop-shadow-md">
                        Go2Culture is about bringing people together—travellers, migrants, and locals—over incredible food in the heart of a local home. We believe the best memories are made around a shared table.
                    </p>
                </div>
            </section>

            {/* Our Philosophy Section */}
            <section className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Philosophy</h2>
                    <p className="mt-2 text-muted-foreground text-lg max-w-2xl mx-auto">We believe in connection, authenticity, and empowerment. These are the pillars that guide every experience on Go2Culture.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {philosophyItems.map((item) => (
                        <Card key={item.title} className="text-center flex flex-col items-center p-6">
                            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <CardHeader className="p-0">
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-2 text-muted-foreground">
                                <p>{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Our Story Section */}
            <section className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="font-headline text-3xl font-bold">Our Story</h2>
                    <p className="text-muted-foreground text-lg">
                        It all started with a simple idea: the best way to truly know a place is to share a meal with the people who call it home. Our founders, a couple of avid travellers, were searching for something more than just another tourist transaction.
                    </p>
                    <p className="text-muted-foreground">
                        They saw a bridge that needed building—one that connects curious travellers with the local storytellers who hold the real keys to a culture. Go2Culture was built to help you step across that bridge, leaving the 'tourist' label behind to become an honoured guest.
                    </p>
                </div>
                {storyImage && (
                    <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                            src={storyImage.imageUrl}
                            alt={storyImage.description}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            data-ai-hint={storyImage.imageHint}
                        />
                    </div>
                )}
            </section>

            {/* Join Our Community CTA */}
            <section className="text-center bg-card p-8 md:p-16 rounded-lg max-w-4xl mx-auto">
                <h2 className="font-headline text-3xl font-bold">Join Our Community</h2>
                <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                    The world is a rich tapestry of cultures waiting to be explored, one story and one meal at a time. Whether you’re looking to discover the true flavour of a new place or you’re a passionate local ready to share your heritage, there’s a seat at our table for you.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" asChild>
                        <Link href="/discover">Find an Experience</Link>
                    </Button>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="/become-a-host">Become a Host</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
