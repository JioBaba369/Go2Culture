'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { countries, regions, suburbs } from '@/lib/location-data';
import { Skeleton } from '@/components/ui/skeleton';

function SearchField({
  label,
  placeholder,
  options,
  onValueChange,
  value,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: { id: string; name: string }[];
  onValueChange: (value: string) => void;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative flex-1 w-full px-4 py-2 sm:py-0 group cursor-pointer hover:bg-accent/50 rounded-full transition-colors duration-200">
      <label className="text-xs font-bold text-foreground">{label}</label>
      <Select onValueChange={onValueChange} value={value} disabled={disabled}>
        <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-auto p-0 bg-transparent data-[placeholder]:text-muted-foreground">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function HeroSearch() {
  const router = useRouter();

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSuburb, setSelectedSuburb] = useState<string>('');

  const [availableRegions, setAvailableRegions] = useState<{ id: string; name: string }[]>([]);
  const [availableSuburbs, setAvailableSuburbs] = useState<{ id: string; name: string }[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setAvailableRegions(regions.filter((s) => s.countryId === selectedCountry));
    } else {
      setAvailableRegions([]);
    }
    setSelectedRegion('');
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedRegion) {
      setAvailableSuburbs(suburbs.filter((s) => s.regionId === selectedRegion));
    } else {
      setAvailableSuburbs([]);
    }
    setSelectedSuburb('');
  }, [selectedRegion]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedSuburb) params.set('suburb', selectedSuburb);
    router.push(`/discover?${params.toString()}`);
  };

  const searchBarContent = (
    <div className="flex flex-col sm:flex-row items-center bg-background rounded-full border shadow-lg h-auto sm:h-[72px] w-full p-2 sm:p-0 sm:pr-2">
      <SearchField
        label="Country"
        placeholder="e.g. Australia"
        options={countries}
        onValueChange={setSelectedCountry}
        value={selectedCountry}
      />
      <Separator orientation="vertical" className="h-8 hidden sm:block" />
      <SearchField
        label="State / Region"
        placeholder="e.g. New South Wales"
        options={availableRegions}
        onValueChange={setSelectedRegion}
        value={selectedRegion}
        disabled={!availableRegions.length}
      />
      <Separator orientation="vertical" className="h-8 hidden sm:block" />
      <SearchField
        label="City"
        placeholder="e.g. Sydney"
        options={availableSuburbs}
        onValueChange={setSelectedSuburb}
        value={selectedSuburb}
        disabled={!availableSuburbs.length}
      />
       <Button onClick={handleSearch} size="lg" className="w-full mt-2 sm:mt-0 sm:w-auto sm:h-14 sm:rounded-full">
          <Search className="h-5 w-5 sm:mr-2" />
           <span className="sm:hidden">Search Locations</span>
           <span className="hidden sm:inline">Search</span>
        </Button>
    </div>
  );
  
  return (
    <div className="mt-8 bg-transparent w-full max-w-4xl">
      {isMounted ? searchBarContent : <Skeleton className="h-[72px] w-full rounded-full" />}
    </div>
  );
}
