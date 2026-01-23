
'use client';

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import type { Experience, Host, Review, User } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Users, MapPin, Utensils, Home, Wind, Accessibility } from "lucide-react";
import { countries, suburbs, localAreas } from "@/lib/location-data";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where, limit } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";

function ReviewItem({ review }: { review: Review }) {
  const firestore = useFirestore();
  const authorRef = useMemoFirebase(
    () => (firestore && review.guestId ? doc(firestore, 'users', review.guestId) : null),
    [firestore, review.guestId]
  );
  const { data: author, isLoading } = useDoc<User>(authorRef);

  if (isLoading || !author) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  const authorImage = PlaceHolderImages.find(p => p.id === author.profilePhotoId);
  
  return (
    <div>
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {authorImage ? (
              <AvatarImage src={authorImage.imageUrl} alt={author.fullName} data-ai-hint={authorImage.imageHint} />
          ) : null}
            <AvatarFallback>{author.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{author.fullName}</p>
          <p className="text-sm text-muted-foreground">{review.createdAt?.toDate ? format(review.createdAt.toDate(), 'PP') : ''}</p>
        </div>
      </div>
      <p className="mt-3 text-muted-foreground">{review.comment}</p>
    </div>
  );
}


export function ExperienceDetailClient({ experienceId }: { experienceId: string }) {
  const [date, setDate] = useState<Date>();
  const firestore = useFirestore();

  const experienceRef = useMemoFirebase(
    () => (firestore ? doc(firestore, "experiences", experienceId) : null),
    [firestore, experienceId]
  );
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);
  
  const hostRef = useMemoFirebase(
    () => (firestore && experience?.userId && experience?.hostId ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId) : null),
    [firestore, experience?.userId, experience?.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  const reviewsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, "reviews"), where("experienceId", "==", experienceId), limit(2)) : null),
    [firestore, experienceId]
  );
  const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsQuery);


  if (isExperienceLoading || isHostLoading) {
     return (
       <div className="py-8 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (!experience || !host) {
     return (
        <div className="py-20 text-center">
            <h1 className="text-2xl font-bold">Experience not found</h1>
            <p className="text-muted-foreground">The experience you are looking for does not exist or the host is not available.</p>
        </div>
    );
  }


  const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
  const hostAvatar = PlaceHolderImages.find(p => p.id === host.profilePhotoId);
  
  const countryName = countries.find(c => c.id === experience.location.country)?.name || experience.location.country;
  const suburbName = suburbs.find(s => s.id === experience.location.suburb)?.name || experience.location.suburb;
  const localAreaName = localAreas.find(l => l.id === experience.location.localArea)?.name || experience.location.localArea;
  const durationHours = Math.round(experience.durationMinutes / 60 * 10) / 10;

  const disabledDays = (day: Date) => {
    if (!experience.availability.days || experience.availability.days.length === 0) {
      return false;
    }
    const dayOfWeek = format(day, 'EEEE');
    return !experience.availability.days.includes(dayOfWeek);
  };

  return (
    <div className="py-8">
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
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl">Hosted by {host.name}</h2>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <span>{durationHours} hours</span>
                <span>·</span>
                <span>Up to {experience.pricing.maxGuests} guests</span>
              </div>
            </div>
            <Avatar className="h-16 w-16">
              {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={host.name} data-ai-hint={hostAvatar.imageHint}/>}
              <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <Separator />
          
          <p className="text-lg leading-relaxed">{experience.description}</p>
          <Separator />

           <div className="space-y-4">
            <h3 className="font-headline text-2xl">What you'll do</h3>
            <div className="flex items-start gap-4">
              <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p>You'll be welcomed into {host.name}'s home for a truly local experience. Share stories, learn about their culture, and enjoy a delicious, authentic meal prepared with love.</p>
            </div>
          </div>
          <Separator />
          
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

          <div className="space-y-4">
            <h3 className="font-headline text-2xl">About your host's home</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>{host.homeSetup.homeType} with {host.homeSetup.seating} seating</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Pets live here: {host.homeSetup.pets ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><span>Smoking allowed: {host.homeSetup.smoking ? 'Yes' : 'No'}</span></div>
                {host.homeSetup.accessibility && <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><span>{host.homeSetup.accessibility}</span></div>}
             </div>
          </div>
          <Separator />
          
          <div>
            <h3 className="font-headline text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-accent fill-accent" />
              {experience.rating.average} ({experience.rating.count} reviews)
            </h3>
            <div className="space-y-6 mt-4">
              {areReviewsLoading ? (
                <>
                  <ReviewItem review={{} as Review} />
                  <ReviewItem review={{} as Review} />
                </>
              ) : reviews && reviews.length > 0 ? (
                reviews.map(review => <ReviewItem key={review.id} review={review} />)
              ) : (
                <p className="text-muted-foreground">No reviews yet for this experience.</p>
              )}
            </div>
            {experience.rating.count > 2 && <Button variant="outline" className="mt-6">Show all {experience.rating.count} reviews</Button>}
          </div>
        </div>
        
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
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={[
                        { before: new Date() },
                        disabledDays
                      ]}
                      className="rounded-md border"
                    />
                     {date && <p className="text-sm text-center text-muted-foreground mt-2">Selected: <strong>{format(date, "PPP")}</strong></p>}
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
