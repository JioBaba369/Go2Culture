
'use client';
import React from 'react';
import Image from 'next/image';
import { Award } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { HowItWorksSection } from '@/components/home/how-it-works';
import { FeaturedExperiencesSection } from '@/components/home/featured-experiences';
import { FeaturedCitiesSection } from '@/components/home/featured-cities';
import { TestimonialsSection } from '@/components/home/testimonials';
import { FeaturedSponsorsSection } from '@/components/home/featured-sponsors';

const HeroSearch = dynamic(() => import('@/components/home/hero-search').then(mod => mod.HeroSearch), {
  ssr: false,
});

const Home = () => {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  return (
    <main>
      <section className="relative bg-cover bg-center h-[70vh] flex items-center justify-center text-center text-white px-4">
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
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <Award className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-6xl font-headline font-bold mt-4">Experience Authentic Food & Culture.</h1>
          <p className="text-lg md:text-2xl mt-4">Go where culture lives—in the homes of passionate locals who are waiting to share their stories and their food.</p>
          <HeroSearch />
        </div>
      </section>
      
      <div className="py-16 md:py-24 space-y-16 md:space-y-24">
        <HowItWorksSection />
        <FeaturedExperiencesSection />
        <FeaturedCitiesSection />
        <TestimonialsSection />
        <FeaturedSponsorsSection />
      </div>
    </main>
  );
};

export default Home;
