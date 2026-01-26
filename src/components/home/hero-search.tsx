'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { countries, regions, suburbs, localAreas } from '@/lib/location-data';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroSearch() {
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');
  const [selectedLocalArea, setSelectedLocalArea] = useState<string>('');

  const [availableRegions, setAvailableRegions] = useState<{ id: string, name: string }[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{ id: string, name: string }[]>([]);
  const [availableLocalAreas, setAvailableLocalAreas] = useState<{ id: string, name: string }[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
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

  const searchBarContent = (
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
  );
  
  return (
    <div className="mt-8 p-2 bg-background/80 backdrop-blur-sm rounded-xl w-full max-w-4xl shadow-lg">
      {isMounted ? searchBarContent : <Skeleton className="h-[58px] w-full" />}
    </div>
  );
}
