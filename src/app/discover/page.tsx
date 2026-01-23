
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ExperienceCard } from "@/components/experience-card";
import { experiences } from "@/lib/data";
import { countries, states, suburbs, localAreas } from "@/lib/location-data";
import type { Experience } from "@/lib/types";

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedSuburb, setSelectedSuburb] = useState(searchParams.get('suburb') || '');
  const [selectedLocalArea, setSelectedLocalArea] = useState(searchParams.get('localArea') || '');

  const [availableStates, setAvailableStates] = useState<{id: string, name: string}[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{id: string, name: string}[]>([]);
  const [availableLocalAreas, setAvailableLocalAreas] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      setAvailableStates(states.filter(s => s.countryId === selectedCountry));
    } else {
      setAvailableStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setAvailableSuburbs(suburbs.filter(s => s.stateId === selectedState));
    } else {
      setAvailableSuburbs([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedSuburb) {
      setAvailableLocalAreas(localAreas.filter(l => l.suburbId === selectedSuburb));
    } else {
      setAvailableLocalAreas([]);
    }
  }, [selectedSuburb]);
  
  // Update filter states when URL params change
  useEffect(() => {
    setSelectedCountry(searchParams.get('country') || '');
    setSelectedState(searchParams.get('state') || '');
    setSelectedSuburb(searchParams.get('suburb') || '');
    setSelectedLocalArea(searchParams.get('localArea') || '');
  }, [searchParams]);


  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedState) params.set('state', selectedState);
    if (selectedSuburb) params.set('suburb', selectedSuburb);
    if (selectedLocalArea) params.set('localArea', selectedLocalArea);
    router.push(`/discover?${params.toString()}`);
  };

  const filteredExperiences = React.useMemo(() => {
    let results: Experience[] = experiences;
    const country = searchParams.get('country');
    const state = searchParams.get('state');
    const suburb = searchParams.get('suburb');
    const localArea = searchParams.get('localArea');

    if (country) {
      results = results.filter(e => e.location.country === country);
    }
    if (state) {
      results = results.filter(e => e.location.state === state);
    }
    if (suburb) {
      results = results.filter(e => e.location.suburb === suburb);
    }
    if (localArea) {
      results = results.filter(e => e.location.localArea === localArea);
    }
    
    return results;
  }, [searchParams]);

  return (
    <div className="space-y-8 py-8">
      <div>
        <h1 className="font-headline text-4xl font-bold">Discover Experiences</h1>
        <p className="text-muted-foreground mt-2">
          {filteredExperiences.length > 0 
           ? `Found ${filteredExperiences.length} cultural adventures.`
           : 'Find your next cultural adventure.'
          }
        </p>
      </div>

      <div className="p-4 bg-card rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Select onValueChange={(value) => { setSelectedCountry(value); setSelectedState(''); setSelectedSuburb(''); setSelectedLocalArea(''); }} value={selectedCountry}>
            <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              {countries.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => { setSelectedState(value); setSelectedSuburb(''); setSelectedLocalArea(''); }} value={selectedState} disabled={!availableStates.length}>
            <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              {availableStates.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => { setSelectedSuburb(value); setSelectedLocalArea(''); }} value={selectedSuburb} disabled={!availableSuburbs.length}>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExperiences.length > 0 ? (
          filteredExperiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <h3 className="font-headline text-2xl">No Experiences Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search filters or exploring a different area.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/discover')}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="py-8">Loading search results...</div>}>
      <DiscoverPageContent />
    </Suspense>
  )
}
