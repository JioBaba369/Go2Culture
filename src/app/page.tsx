
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Users, Home as HomeIcon, Award, Star } from "lucide-react";
import { ExperienceCard } from "@/components/experience-card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { countries, regions, suburbs, localAreas } from "@/lib/location-data";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, limit, query } from "firebase/firestore";
import { Experience, Review } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TestimonialCard } from "@/components/testimonial-card";
import { Card, CardContent } from "@/components/ui/card";


const cityImageMap: Record<string, string> = {
    SYD: 'city-sydney',
    MEL: 'city-melbourne',
    AKL: 'city-auckland',
    WLG: 'city-wellington',
    BRI: 'city-brisbane',
    PER: 'city-perth',
    ADL: 'city-adelaide',
    CBR: 'city-canberra',
    HBA: 'city-hobart',
    CHC: 'city-christchurch',
    ZQN: 'city-queenstown',
    HLZ: 'city-hamilton',
    TRG: 'city-tauranga',
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  const router = useRouter();
  const firestore = useFirestore();

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [selectedLocalArea, setSelectedLocalArea] = useState<string>('');

  const [availableRegions, setAvailableRegions] = useState<{id: string, name: string}[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{id: string, name: string}[]>([]);
  const [availableLocalAreas, setAvailableLocalAreas] = useState<{id: string, name: string}[]>([]);

  const experiencesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'experiences'), limit(4)) : null,
    [firestore]
  );
  const { data: experiences, isLoading } = useCollection<Experience>(experiencesQuery);

  const reviewsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'reviews'), limit(3)) : null,
    [firestore]
  );
  const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsQuery);

  const featuredCities = useMemo(() => {
    // Only feature a few distinct cities for the homepage
    const cityIds = ['SYD', 'MEL', 'AKL', 'WLG'];
    return suburbs.filter(s => cityIds.includes(s.id));
}, []);


  useEffect(() => {
    if (selectedCountry) {
      setAvailableRegions(regions.filter(s => s.countryId === selectedCountry));
      setSelectedRegion('');
      setSelectedSuburb('');
      setSelectedLocalArea('');
      setAvailableSuburbs([]);
      setAvailableLocalAreas([]);
    } else {
      setAvailableRegions([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedRegion) {
      setAvailableSuburbs(suburbs.filter(s => s.regionId === selectedRegion));
      setSelectedSuburb('');
      setSelectedLocalArea('');
      setAvailableLocalAreas([]);
    } else {
      setAvailableSuburbs([]);
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedSuburb) {
      setAvailableLocalAreas(localAreas.filter(l => l.suburbId === selectedSuburb));
      setSelectedLocalArea('');
    } else {
      setAvailableLocalAreas([]);
    }
  }, [selectedSuburb]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedSuburb) params.set('suburb', selectedSuburb);
    if (selectedLocalArea) params.set('localArea', selectedLocalArea);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-20">
        <div className="w-full h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[900px]">
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
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
            Go Where Culture Lives
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 drop-shadow-md">
            Where do you want to experience culture?
          </p>
          <div className="mt-8 p-2 bg-background/80 backdrop-blur-sm rounded-xl w-full max-w-4xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-0 bg-background rounded-md border p-1">
                <div className="w-full sm:w-auto flex-1">
                    <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                        <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-12"><SelectValue placeholder="Country" /></SelectTrigger>
                        <SelectContent>
                          {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="w-full sm:w-auto flex-1">
                    <Select onValueChange={setSelectedRegion} value={selectedRegion} disabled={!availableRegions.length}>
                        <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-12"><SelectValue placeholder="State / Region" /></SelectTrigger>
                        <SelectContent>
                          {availableRegions.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="w-full sm:w-auto flex-1">
                    <Select onValueChange={setSelectedSuburb} value={selectedSuburb} disabled={!availableSuburbs.length}>
                        <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-12"><SelectValue placeholder="Suburb/City" /></SelectTrigger>
                        <SelectContent>
                          {availableSuburbs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="w-full sm:w-auto flex-1">
                    <Select onValueChange={setSelectedLocalArea} value={selectedLocalArea} disabled={!availableLocalAreas.length}>
                        <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-12"><SelectValue placeholder="Area" /></SelectTrigger>
                        <SelectContent>
                          {availableLocalAreas.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleSearch} size="lg" className="w-full sm:w-auto h-12 rounded-md">
                    <Search className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Search</span>
                </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="font-headline text-3xl md:text-4xl font-semibold">How It Works</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">A new way to experience culture, in three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold font-headline">Discover</h3>
            <p className="text-muted-foreground mt-2">Find unique cultural experiences hosted by passionate locals in their homes.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
              <HomeIcon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold font-headline">Book Securely</h3>
            <p className="text-muted-foreground mt-2">Choose your date, book your seat, and connect with your host through our trusted platform.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold font-headline">Experience</h3>
            <p className="text-muted-foreground mt-2">Share a meal, stories, and traditions. It's more than travel, it's connection.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Featured Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            experiences?.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))
          )}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/discover">Explore All Experiences</Link>
          </Button>
        </div>
      </section>
      
      <section>
        <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Featured Cities</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">Discover authentic experiences in our most popular destinations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)
          ) : (
            featuredCities.map(city => {
              const cityImageId = cityImageMap[city.id];
              const cityImage = PlaceHolderImages.find(p => p.id === cityImageId);
              return (
                <Link key={city.id} href={`/discover?suburb=${city.id}`} className="group block">
                  <Card className="overflow-hidden relative h-80 rounded-lg">
                    {cityImage && (
                      <Image
                        src={cityImage.imageUrl}
                        alt={city.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={cityImage.imageHint}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="font-headline absolute bottom-4 left-4 text-2xl font-bold text-white">
                      {city.name}
                    </h3>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What Our Community is Saying</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 max-w-7xl mx-auto">
          {areReviewsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-full">
                <CardContent className="p-6">
                  <div className="flex mb-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-5" />)}</div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            reviews?.map(review => (
              <TestimonialCard key={review.id} review={review} />
            ))
          )}
        </div>
      </section>

      <section className="bg-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <Award className="h-12 w-12 text-accent mb-4"/>
          <h2 className="font-headline text-3xl md:text-4xl font-semibold">Share Your Culture. Become a Host.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">Open your home to travelers and locals, share your passion for food and culture, and earn on your own schedule. Join our global community of hosts today.</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/become-a-host">Learn More & Apply</Link>
          </Button>
        </div>
        <div className="flex-1 w-full h-64 md:h-80 relative rounded-lg overflow-hidden">
          {PlaceHolderImages.find(p => p.id === 'host-cta') &&
            <Image 
              src={PlaceHolderImages.find(p => p.id === 'host-cta')!.imageUrl} 
              alt="A host welcoming guests" 
              fill 
              className="object-cover" 
              data-ai-hint={PlaceHolderImages.find(p => p.id === 'host-cta')!.imageHint}
            />
          }
        </div>
      </section>
    </div>
  );
}
