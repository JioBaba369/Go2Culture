
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Experience } from '@/lib/types';


export function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const firestore = useFirestore();

  const experiencesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'experiences'), where('status', '==', 'live')) : null),
    [firestore]
  );
  const { data: experiences, isLoading: areExperiencesLoading } = useCollection<Experience>(experiencesQuery);
  
  const categories = useMemo(() => {
    if (!experiences) return [];
    return [...new Set(experiences.map(exp => exp.category))].sort();
  }, [experiences]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (category && category !== 'all') {
      params.set('category', category);
    }
    
    const queryString = params.toString();
    router.push(`/discover${queryString ? `?${queryString}` : ''}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mt-8 w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border/20 shadow-lg">
        <div className="relative flex-grow w-full flex items-center">
          <MapPin className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search city, cuisine, or experience"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-lg border-input bg-background/50 pl-10 pr-4 text-base focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="relative w-full sm:w-52 flex items-center">
          <Tag className="absolute left-3 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Select value={category} onValueChange={setCategory} disabled={areExperiencesLoading}>
            <SelectTrigger className="h-12 w-full rounded-lg border-input bg-background/50 pl-10 text-base focus:ring-2 focus:ring-primary">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Category</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} className="h-12 w-full sm:w-auto rounded-lg px-6 text-base">
          <Search className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </div>
  );
}
