
'use client';

import Link from 'next/link';

const topSearches = [
  { name: 'Cooking classes in Paris', href: '/discover?category=Cooking%20Class&city=Paris' },
  { name: 'Food tours in Rome', href: '/discover?category=History%20%26%20Walks&city=Rome' },
  { name: 'Rooftop brunches in New York', href: '/discover?category=Special%20Event&city=New%20York' },
  { name: 'Supper clubs in London', href: '/discover?category=In-Home%20Dining&city=London' },
  { name: 'Pasta-making classes in Rome', href: '/discover?category=Cooking%20Class&city=Rome' },
  { name: 'Canal house dining in Amsterdam', href: '/discover?category=In-Home%20Dining&city=Amsterdam' },
];

export function TopSearchesSection() {
    return (
        <section>
            <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Popular Searches</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">Get inspired by what others are looking for.</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
                {topSearches.map(search => (
                    <Link
                        key={search.name}
                        href={search.href}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        {search.name}
                    </Link>
                ))}
            </div>
        </section>
    );
}
