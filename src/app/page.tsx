"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Home as HomeIcon, Award } from "lucide-react";
import { ExperienceCard } from "@/components/experience-card";
import { experiences } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { countries, states, suburbs, localAreas } from "@/lib/location-data";
import type { Experience } from "@/lib/types";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');

  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(experiences.slice(0, 4));

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [selectedLocalArea, setSelectedLocalArea] = useState<string>('');

  const [availableStates, setAvailableStates] = useState<{id: string, name: string}[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{id: string, name: string}[]>([]);
  const [availableLocalAreas, setAvailableLocalAreas] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      setAvailableStates(states.filter(s => s.countryId === selectedCountry));
      setSelectedState('');
      setSelectedSuburb('');
      setSelectedLocalArea('');
      setAvailableSuburbs([]);
      setAvailableLocalAreas([]);
    } else {
      setAvailableStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setAvailableSuburbs(suburbs.filter(s => s.stateId === selectedState));
      setSelectedSuburb('');
      setSelectedLocalArea('');
      setAvailableLocalAreas([]);
    } else {
      setAvailableSuburbs([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedSuburb) {
      setAvailableLocalAreas(localAreas.filter(l => l.suburbId === selectedSuburb));
      setSelectedLocalArea('');
    } else {
      setAvailableLocalAreas([]);
    }
  }, [selectedSuburb]);

  const handleSearch = () => {
    let results = experiences;
    if (selectedLocalArea) {
      results = results.filter(e => e.localArea === selectedLocalArea);
    } else if (selectedSuburb) {
      results = results.filter(e => e.suburb === selectedSuburb);
    } else if (selectedState) {
      results = results.filter(e => e.state === selectedState);
    } else if (selectedCountry) {
      results = results.filter(e => e.country === selectedCountry);
    }
    setFilteredExperiences(results.slice(0, 4));
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-lg">
            Go Where Culture Lives
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 drop-shadow-md">
            Where do you want to experience culture?
          </p>
          <div className="mt-8 p-4 bg-background/90 backdrop-blur-sm rounded-lg w-full max-w-4xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Select onValueChange={setSelectedCountry} value={selectedCountry}>
                <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedState} value={selectedState} disabled={!availableStates.length}>
                <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                <SelectContent>
                  {availableStates.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select onValueChange={setSelectedSuburb} value={selectedSuburb} disabled={!availableSuburbs.length}>
                <SelectTrigger><SelectValue placeholder="Suburb/City" /></SelectTrigger>
                <SelectContent>
                  {availableSuburbs.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select onValueChange={setSelectedLocalArea} value={selectedLocalArea} disabled={!availableLocalAreas.length}>
                <SelectTrigger><SelectValue placeholder="Local Area" /></SelectTrigger>
                <SelectContent>
                  {availableLocalAreas.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" /> Search
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
          {filteredExperiences.length > 0 ? (
            filteredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No experiences found for your selection.</p>
          )}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/discover">Explore All Experiences</Link>
          </Button>
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
