'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/discover');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="mt-8 bg-transparent w-full max-w-lg">
      <div className="flex bg-background rounded-full border h-auto w-full overflow-hidden items-center pr-2">
        <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
                type="text"
                placeholder="Search by city, cuisine, or experience..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-14 w-full border-none bg-transparent pl-14 pr-4 text-base focus-visible:ring-0"
            />
        </div>
        <Button onClick={handleSearch} size="lg" className="rounded-full font-semibold px-8">
          Search
        </Button>
      </div>
    </div>
  );
}
