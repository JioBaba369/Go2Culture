
import { Globe, Users, Utensils } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AboutPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">About Go2Culture</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    We believe the most memorable travel experiences happen when you connect with local people and their culture.
                </p>
            </div>

            {heroImage && (
                <div className="my-12 relative h-96 w-full max-w-5xl mx-auto overflow-hidden rounded-lg">
                    <Image
                        src={heroImage.imageUrl}
                        alt="A vibrant dinner party"
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                    />
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center">
                    <h2 className="font-headline text-3xl font-bold">Our Mission</h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                        To break down cultural barriers by creating a world where anyone can share and experience culture, one home-cooked meal at a time. We want to take you beyond the restaurants and tourist spots, and into the heart of a place: its homes.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Authentic Food</h3>
                        <p className="text-muted-foreground mt-2">Experience real, homemade food that you won't find in a restaurant.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Real Connections</h3>
                        <p className="text-muted-foreground mt-2">Share stories and create lasting memories with local hosts.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Globe className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Cultural Exchange</h3>
                        <p className="text-muted-foreground mt-2">Learn about traditions, languages, and ways of life directly from the source.</p>
                    </div>
                </div>

                 <div className="text-center pt-8">
                    <h2 className="font-headline text-3xl font-bold">The Go2Culture Story</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        Go2Culture was founded by a group of travelers who realized their best memories weren't from seeing monuments, but from the meals they shared with local families. From a crowded apartment in Naples to a bustling kitchen in Mumbai, these were the moments where they truly felt connected. We built Go2Culture to make those experiences accessible to everyone.
                    </p>
                </div>
            </div>
        </div>
    );
}
