
'use client';

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import type { Experience } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin, Utensils, Home, Wind, Accessibility, CalendarIcon } from "lucide-react";
import { countries, suburbs, localAreas } from "@/lib/location-data";
import { cn } from "@/lib/utils";

export function ExperienceDetailClient({ experience }: { experience: Experience }) {
  const [date, setDate] = useState<Date>();

  const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
  const hostAvatar = PlaceHolderImages.find(p => p.id === experience.host.profilePhotoId);
  
  const countryName = countries.find(c => c.id === experience.location.country)?.name || experience.location.country;
  const suburbName = suburbs.find(s => s.id === experience.location.suburb)?.name || experience.location.suburb;
  const localAreaName = localAreas.find(l => l.id === experience.location.localArea)?.name || experience.location.localArea;
  const durationHours = Math.round(experience.durationMinutes / 60 * 10) / 10;

  const disabledDays = (day: Date) => {
    if (!experience.availability.days || experience.availability.days.length === 0) {
      return false; // If no availability is specified, assume all days are bookable
    }
    const dayOfWeek = format(day, 'EEEE'); // e.g., "Monday"
    // The 'disabled' prop disables the day if the function returns 'true'.
    // So, we return 'true' if the day of the week is NOT in the host's availability list.
    return !experience.availability.days.includes(dayOfWeek);
  };

  return (
    <div className="py-8">
      {/* Title Section */}
      <div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{experience.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <span className="font-bold text-foreground">{experience.rating.average}</span>
            <span>({experience.rating.count} reviews)</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-5 w-5" />
            <span>{localAreaName}, {suburbName}, {countryName}</span>
          </div>
        </div>
      </div>
      
      {/* Image Gallery */}
      <div className="mt-6">
        <div className="relative h-96 w-full overflow-hidden rounded-lg">
           {mainImage && (
            <Image
              src={mainImage.imageUrl}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              data-ai-hint={mainImage.imageHint}
            />
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl">Hosted by {experience.host.name}</h2>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <span>{durationHours} hours</span>
                <span>·</span>
                <span>Up to {experience.pricing.maxGuests} guests</span>
              </div>
            </div>
            <Avatar className="h-16 w-16">
              {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={experience.host.name} data-ai-hint={hostAvatar.imageHint}/>}
              <AvatarFallback>{experience.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <Separator />
          
          {/* Description */}
          <p className="text-lg leading-relaxed">{experience.description}</p>
          <Separator />

          {/* What you'll do */}
           <div className="space-y-4">
            <h3 className="font-headline text-2xl">What you'll do</h3>
            <div className="flex items-start gap-4">
              <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p>You'll be welcomed into {experience.host.name}'s home for a truly local experience. Share stories, learn about their culture, and enjoy a delicious, authentic meal prepared with love.</p>
            </div>
          </div>
          <Separator />
          
          {/* Menu */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">On the Menu</h3>
            <p className="italic text-muted-foreground">"{experience.menu.description}"</p>
            <div className="flex flex-wrap gap-4">
                <Badge variant="secondary">Cuisine: {experience.menu.cuisine}</Badge>
                <Badge variant="secondary">Spice: {experience.menu.spiceLevel}</Badge>
                {experience.menu.dietary.map(d => <Badge key={d} variant="outline">{d}</Badge>)}
            </div>
          </div>
          <Separator />

           {/* Home details */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">About your host's home</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>{experience.host.homeSetup.homeType} with {experience.host.homeSetup.seating} seating</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Pets live here: {experience.host.homeSetup.pets ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><span>Smoking allowed: {experience.host.homeSetup.smoking ? 'Yes' : 'No'}</span></div>
                {experience.host.homeSetup.accessibility && <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><span>{experience.host.homeSetup.accessibility}</span></div>}
             </div>
          </div>
          <Separator />
          
           {/* Reviews */}
          <div>
            <h3 className="font-headline text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-accent fill-accent" />
              {experience.rating.average} ({experience.rating.count} reviews)
            </h3>
            <div className="space-y-6 mt-4">
              {experience.reviews.slice(0, 2).map(review => {
                const authorImage = PlaceHolderImages.find(p => p.id === review.author.profilePhotoId);
                return (
                  <div key={review.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {authorImage ? (
                           <AvatarImage src={authorImage.imageUrl} alt={review.author.name} data-ai-hint={authorImage.imageHint} />
                        ) : (
                           <AvatarImage src={`https://picsum.photos/seed/${review.author.name}/100/100`} />
                        )}
                         <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.author.name}</p>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-muted-foreground">{review.comment}</p>
                  </div>
                );
              })}
            </div>
             <Button variant="outline" className="mt-6">Show all {experience.rating.count} reviews</Button>
          </div>
        </div>
        
        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span><span className="text-3xl font-bold">${experience.pricing.pricePerGuest}</span> / person</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4"/>
                  <span>{experience.rating.average} ({experience.rating.count})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Select a date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={[
                            { before: new Date() },
                            disabledDays
                          ]}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                 <Button size="lg" className="w-full mt-4" disabled={!date}>Book Now</Button>
                 <p className="text-xs text-center text-muted-foreground mt-2">You won't be charged yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
