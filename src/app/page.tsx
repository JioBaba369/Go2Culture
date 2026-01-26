
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import dynamic from "next/dynamic";
import { HeroSearch } from "@/components/home/hero-search";
import { PlaceHolderImages } from "@/lib/placeholder-images";


const HowItWorksSection = dynamic(() => import('@/components/home/how-it-works').then(mod => mod.HowItWorksSection));
const FeaturedExperiencesSection = dynamic(() => import('@/components/home/featured-experiences').then(mod => mod.FeaturedExperiencesSection));
const FeaturedCitiesSection = dynamic(() => import('@/components/home/featured-cities').then(mod => mod.FeaturedCitiesSection));
const TopSearchesSection = dynamic(() => import('@/components/home/top-searches').then(mod => mod.TopSearchesSection));
const TestimonialsSection = dynamic(() => import('@/components/home/testimonials').then(mod => mod.TestimonialsSection));
const FeaturedSponsorsSection = dynamic(() => import('@/components/home/featured-sponsors').then(mod => mod.FeaturedSponsorsSection));


export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  const hostCtaImage = PlaceHolderImages.find(p => p.id === 'host-cta');

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-20">
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] max-h-[900px]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg">
            Experience Authentic Food & Culture.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 drop-shadow-md">
            Go where culture lives.
          </p>
          <HeroSearch />
        </div>
      </section>

      <HowItWorksSection />
      <FeaturedExperiencesSection />
      <FeaturedCitiesSection />
      <TopSearchesSection />
      <TestimonialsSection />
      <FeaturedSponsorsSection />

      <section className="bg-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <Award className="h-12 w-12 text-accent mb-4"/>
          <h2 className="font-headline text-3xl md:text-4xl font-semibold">Share Your Culture. Become a Host.</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">Open your home to travelers and locals, share your passion for food and culture, and earn on your own schedule. Join our global community of hosts today.</p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/become-a-host">Learn More & Apply</Link>
          </Button>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-80 relative rounded-lg overflow-hidden">
          {hostCtaImage &&
            <Image 
              src={hostCtaImage.imageUrl} 
              alt={hostCtaImage.description} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              data-ai-hint={hostCtaImage.imageHint}
            />
          }
        </div>
      </section>
    </div>
  );
}
