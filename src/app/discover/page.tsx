
'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Experience } from '@/lib/types';
import { ExperienceCard } from '@/components/experience-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const { data: allExperiences, isLoading: areExperiencesLoading } = useCollection<Experience>(
    useMemoFirebase(() => (firestore ? collection(firestore, 'experiences') : null), [firestore])
  );

  const allCuisines = useMemo(() => allExperiences ? [...new Set(allExperiences.map(e => e.menu.cuisine))] : [], [allExperiences]);
  const allDietary = useMemo(() => allExperiences ? [...new Set(allExperiences.flatMap(e => e.menu.dietary || []))] : [], [allExperiences]);
  const allCategories = useMemo(() => allExperiences ? [...new Set(allExperiences.map(e => e.category))] : [], [allExperiences]);
  const maxPrice = useMemo(() => allExperiences && allExperiences.length > 0 ? Math.ceil(Math.max(...allExperiences.map(e => e.pricing.pricePerGuest)) / 5) * 5 : 150, [allExperiences]);

  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || 'all');
  const [dietary, setDietary] = useState<string[]>(searchParams.getAll('dietary'));
  const [categories, setCategories] = useState<string[]>(searchParams.getAll('category'));
  const [price, setPrice] = useState([maxPrice]);
  const [rating, setRating] = useState('all');

  useMemo(() => {
    if(maxPrice > 0) setPrice([maxPrice]);
  }, [maxPrice]);
  
  const filteredExperiences = useMemo(() => {
    if (!allExperiences) return [];
    return allExperiences.filter(exp => {
      if (cuisine !== 'all' && exp.menu.cuisine !== cuisine) return false;
      if (categories.length > 0 && !categories.includes(exp.category)) return false;
      if (dietary.length > 0 && !dietary.every(d => exp.menu.dietary?.includes(d))) return false;
      if (exp.pricing.pricePerGuest > price[0]) return false;
      if (rating !== 'all' && exp.rating.average < Number(rating)) return false;
      if (searchParams.get('country') && exp.location.country !== searchParams.get('country')) return false;
      if (searchParams.get('region') && exp.location.region !== searchParams.get('region')) return false;
      if (searchParams.get('suburb') && exp.location.suburb !== searchParams.get('suburb')) return false;
      if (searchParams.get('localArea') && exp.location.localArea !== searchParams.get('localArea')) return false;
      return true;
    });
  }, [cuisine, dietary, categories, price, rating, searchParams, allExperiences]);

  const handleDietaryChange = (option: string) => {
    setDietary(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };
  
  const handleCategoryChange = (option: string) => {
    setCategories(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const filtersJsx = (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Cuisine</label>
        <Select value={cuisine} onValueChange={setCuisine}>
          <SelectTrigger><SelectValue placeholder="Select Cuisine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            {allCuisines.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Experience Type</label>
        <div className="space-y-2">
          {allCategories.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${option}`}
                checked={categories.includes(option)}
                onCheckedChange={() => handleCategoryChange(option)}
              />
              <label htmlFor={`category-${option}`} className="text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Price</label>
        <p className="text-sm text-muted-foreground">Up to ${price[0]}</p>
        <Slider
          min={0}
          max={maxPrice}
          step={5}
          value={price}
          onValueChange={setPrice}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Dietary Options</label>
        <div className="space-y-2">
          {allDietary.map(option => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`dietary-${option}`}
                checked={dietary.includes(option)}
                onCheckedChange={() => handleDietaryChange(option)}
              />
              <label htmlFor={`dietary-${option}`} className="text-sm">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <Separator />

      <div className="space-y-2">
        <label className="text-sm font-medium">Minimum Rating</label>
         <Select value={rating} onValueChange={setRating}>
          <SelectTrigger><SelectValue placeholder="Any Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="4.5">4.5 stars & up</SelectItem>
            <SelectItem value="4">4 stars & up</SelectItem>
            <SelectItem value="3.5">3.5 stars & up</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="py-12">
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Discover Experiences</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Find your next unforgettable cultural dining experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
        <aside className="hidden lg:block lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Filter Results</CardTitle></CardHeader>
            <CardContent>{filtersJsx}</CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="mr-2 h-4 w-4" /> Show Filters
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader><SheetTitle>Filter Results</SheetTitle></SheetHeader>
                <div className="mt-4">{filtersJsx}</div>
              </SheetContent>
            </Sheet>
          </div>

          <p className="text-muted-foreground mb-4">Showing {filteredExperiences.length} of {allExperiences?.length || 0} experiences.</p>
          {areExperiencesLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
            </div>
          ) : filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredExperiences.map(experience => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center text-center p-12 h-96">
                <h3 className="text-xl font-semibold">No Experiences Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find more results.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverPageContent />
    </Suspense>
  )
}
