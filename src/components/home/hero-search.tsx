'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const categories = [
  "In-Home Dining",
  "Cooking Class",
  "Restaurant Experience",
  "Special Event",
  "Art & Craft",
  "Music & Dance",
  "History & Walks"
];

export function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

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
    <div className="mt-8 bg-transparent w-full max-w-2xl">
      <div className="flex flex-col sm:flex-row bg-background/90 backdrop-blur-sm rounded-full border border-white/20 shadow-lg h-auto w-full overflow-hidden items-center p-2 gap-2 sm:gap-0 transition-all focus-within:ring-2 focus-within:ring-primary/50">
        
        <div className="relative flex-grow w-full sm:w-auto flex items-center">
            <MapPin className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                placeholder="City, cuisine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 w-full border-none bg-transparent pl-11 pr-4 text-base focus-visible:ring-0"
            />
        </div>

        <Separator orientation="vertical" className="h-8 hidden sm:block bg-border" />
        
        <div className="relative flex-grow w-full sm:w-auto flex items-center">
          <Tag className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
           <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 w-full border-none bg-transparent pl-11 text-base focus:ring-0 focus:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:ring-offset-0">
                  <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">Any Category</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} className="rounded-full font-semibold px-6 h-12 w-full sm:w-auto">
          <Search className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </div>
    </div>
  );
}
