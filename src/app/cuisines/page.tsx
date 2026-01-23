
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { experiences } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const allCuisines = [...new Set(experiences.map(e => e.menu.cuisine))];

const cuisineImageMap: Record<string, string> = {
    Italian: 'cuisine-italian',
    Mexican: 'cuisine-mexican',
    Japanese: 'cuisine-japanese',
    Indian: 'cuisine-indian',
}

export default function CuisinesPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Cuisines</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Discover authentic home-cooked meals from cultures all around the world.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12 max-w-7xl mx-auto">
                {allCuisines.map((cuisine) => {
                    const imageId = cuisineImageMap[cuisine];
                    const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : null;
                    
                    return (
                        <Link key={cuisine} href={`/discover?cuisine=${encodeURIComponent(cuisine)}`} className="group block">
                             <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                <div className="relative h-64 w-full">
                                    {image ? (
                                        <Image
                                            src={image.imageUrl}
                                            alt={cuisine}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            data-ai-hint={image.imageHint}
                                        />
                                    ) : (
                                        <div className="bg-muted h-full w-full flex items-center justify-center">
                                            <span className="text-muted-foreground">{cuisine}</span>
                                        </div>
                                    )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                     <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white">
                                        {cuisine}
                                    </h3>
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
