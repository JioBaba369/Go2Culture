
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { experiences } from '@/lib/data';
import { suburbs } from '@/lib/location-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Get cities that actually have experiences
const citiesWithExperiences = [...new Set(experiences.map(e => e.location.suburb))];
const featuredCities = suburbs.filter(s => citiesWithExperiences.includes(s.id));

const cityImageMap: Record<string, string> = {
    ROME: 'city-rome',
    MEXCITY: 'city-mexico-city',
    KYOTO: 'city-kyoto',
    BANG: 'city-bangalore',
    SYD: 'city-sydney',
    MEL: 'city-melbourne',
}


export default function CitiesPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Explore Cities</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Find unique cultural dining experiences in cities around the globe.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-7xl mx-auto">
                {featuredCities.map((city) => {
                    const imageId = cityImageMap[city.id];
                    const image = imageId ? PlaceHolderImages.find(p => p.id === imageId) : null;
                    
                    return (
                        <Link key={city.id} href={`/discover?suburb=${city.id}`} className="group block">
                             <Card className="overflow-hidden transition-all group-hover:shadow-xl group-hover:-translate-y-1">
                                <div className="relative h-80 w-full">
                                    {image ? (
                                        <Image
                                            src={image.imageUrl}
                                            alt={city.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            data-ai-hint={image.imageHint}
                                        />
                                    ) : (
                                        <div className="bg-muted h-full w-full flex items-center justify-center">
                                            <span className="text-muted-foreground">{city.name}</span>
                                        </div>
                                    )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                     <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white">
                                        {city.name}
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
