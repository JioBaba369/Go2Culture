
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Award } from "lucide-react";
import { countries, regions, suburbs, localAreas } from "@/lib/location-data";
import dynamic from "next/dynamic";

const HowItWorksSection = dynamic(() => import('@/components/home/how-it-works').then(mod => mod.HowItWorksSection));
const FeaturedExperiencesSection = dynamic(() => import('@/components/home/featured-experiences').then(mod => mod.FeaturedExperiencesSection));
const FeaturedCitiesSection = dynamic(() => import('@/components/home/featured-cities').then(mod => mod.FeaturedCitiesSection));
const TestimonialsSection = dynamic(() => import('@/components/home/testimonials').then(mod => mod.TestimonialsSection));
const FeaturedSponsorsSection = dynamic(() => import('@/components/home/featured-sponsors').then(mod => mod.FeaturedSponsorsSection));


export default function Home() {
  const heroImageURL = "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxvdXRkb29yJTIwZGlubmVyfGVufDB8fHx8MTc2OTEwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080";
  const hostCtaImageURL = "https://images.unsplash.com/photo-1625213035705-f37ae3048266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHx3ZWxjb21pbmclMjBob21lfGVufDB8fHx8MTc2OTEwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080";
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [selectedLocalArea, setSelectedLocalArea] = useState<string>('');

  const [availableRegions, setAvailableRegions] = useState<{id: string, name: string}[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{id: string, name: string}[]>([]);
  const [availableLocalAreas, setAvailableLocalAreas] = useState<{id: string, name: string}[]>([]);

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
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[900px]">
          {heroImageURL && (
            <Image
              src={heroImageURL}
              alt="A vibrant outdoor dinner party at dusk"
              fill
              className="object-cover"
              sizes="100vw"
              priority
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

      <HowItWorksSection />
      <FeaturedExperiencesSection />
      <FeaturedCitiesSection />
      <TestimonialsSection />
      <FeaturedSponsorsSection />

      <section className="bg-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <Award className="h-12 w-12 text-accent mb-4"/>
          <h2 className="font-headline text-3xl md:text-4xl font-semibold">Share Your Culture. Become a Host.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">Open your home to travelers and locals, share your passion for food and culture, and earn on your own schedule. Join our global community of hosts today.</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/become-a-host">Learn More & Apply</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-80 relative rounded-lg overflow-hidden">
          {hostCtaImageURL &&
            <Image 
              src={hostCtaImageURL} 
              alt="A host welcoming guests" 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover" 
            />
          }
        </div>
      </section>
    </div>
  );
}
