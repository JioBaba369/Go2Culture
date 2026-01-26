'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { countries, regions, suburbs } from '@/lib/location-data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// A single field in the search bar
function SearchField({
  label,
  placeholder,
  options,
  onValueChange,
  value,
  disabled,
  children,
  className,
}: {
  label: string;
  placeholder: string;
  options: { id: string; name: string }[];
  onValueChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex-1 w-full sm:w-auto p-4 sm:px-6 flex justify-between items-center group cursor-pointer hover:bg-muted/50 transition-colors duration-200",
        className
      )}
    >
      <div className="flex-grow">
        <label className="text-xs font-bold text-foreground">{label}</label>
        <Select onValueChange={onValueChange} value={value} disabled={disabled}>
          <SelectTrigger className="border-none shadow-none focus:ring-0 text-base h-auto p-0 bg-transparent data-[placeholder]:text-muted-foreground -mt-0.5">
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
      {children}
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
    setSelectedSuburb('');
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
    <div className="flex flex-col sm:flex-row bg-background rounded-full border shadow-lg h-auto w-full divide-y sm:divide-y-0 sm:divide-x overflow-hidden">
      <SearchField
        label="Country"
        placeholder="Where to?"
        options={countries}
        onValueChange={setSelectedCountry}
        value={selectedCountry}
      />
      <SearchField
        label="Region"
        placeholder="Any region"
        options={availableRegions}
        onValueChange={setSelectedRegion}
        value={selectedRegion}
        disabled={!selectedCountry}
      />
      <SearchField
        label="City"
        placeholder="Any city"
        options={availableSuburbs}
        onValueChange={setSelectedSuburb}
        value={selectedSuburb}
        disabled={!selectedRegion}
      >
        <Button onClick={handleSearch} size="lg" className="sm:h-14 sm:w-14 rounded-full bg-primary hover:bg-primary/90 ml-4">
          <Search className="h-5 w-5" />
           <span className="sr-only">Search</span>
        </Button>
      </SearchField>
    </div>
  );

  return (
    <div className="mt-8 bg-transparent w-full max-w-3xl">
      {isMounted ? searchBarContent : <Skeleton className="h-20 w-full rounded-full" />}
    </div>
  );
}