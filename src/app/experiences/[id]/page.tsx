'use client';

import { forwardRef } from "react";
import Image from "next/image";
import type { Experience, Host, Review } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Utensils, Home, Wind, Accessibility, AlertTriangle, Award, Trophy, Baby, ArrowUpFromLine, AirVent, Wifi, Car, Bus, PartyPopper, Brush, Music, Landmark } from "lucide-react";
import { countries, suburbs, localAreas } from "@/lib/location-data";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WishlistButton } from "@/components/wishlist-button";
import { ExperienceMap } from "@/components/experience-map";
import { BookingWidget } from "@/components/experience/BookingWidget";
import { ReviewItem } from "@/components/experience/ReviewItem";
import { Button } from "@/components/ui/button";
import { getFlagEmoji } from "@/lib/format";

const categoryIcons: Record<string, React.ElementType> = {
    'In-Home Dining': Home,
    'Cooking Class': Utensils,
    'Restaurant Experience': Utensils,
    'Special Event': PartyPopper,
    'Art & Craft': Brush,
    'Music & Dance': Music,
    'History & Walks': Landmark,
};

export default function ExperienceDetailPage() {
  const params = useParams();
  const experienceId = params.id as string;

  const firestore = useFirestore();

  const experienceRef = useMemoFirebase(
    () => (firestore && experienceId ? doc(firestore, "experiences", experienceId) : null),
    [firestore, experienceId]
  );
  const { data: experience, isLoading: isExperienceLoading } = useDoc<Experience>(experienceRef);
  
  const hostRef = useMemoFirebase(
    () => (firestore && experience?.userId && experience?.hostId ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId) : null),
    [firestore, experience?.userId, experience?.hostId]
  );
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  const reviewsQuery = useMemoFirebase(
    () => (firestore && experienceId ? query(collection(firestore, "reviews"), where("experienceId", "==", experienceId), limit(2)) : null),
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
  const CategoryIcon = categoryIcons[experience.category];

  return (
    <div className="py-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold">{experience.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-muted-foreground">
                {CategoryIcon && <div className="flex items-center gap-1"><CategoryIcon className="h-5 w-5" /><span>{experience.category}</span></div>}
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-accent fill-accent" />
                    <span className="font-bold text-foreground">{experience.rating.average}</span>
                    <span>({experience.rating.count} reviews)</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <div className="flex items-center gap-1">
                    <MapPin className="h-5 w-5" />
                    <span>{localAreaName}, {suburbName}, {countryName}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <span>{durationHours} hours</span>
                <span className="text-muted-foreground hidden sm:inline">·</span>
                <span>Up to {experience.pricing.maxGuests} guests</span>
            </div>
        </div>
        <WishlistButton experienceId={experience.id} className="h-12 w-12 flex-shrink-0" />
      </div>
      
      {/* MAIN IMAGE */}
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
        {/* LEFT COLUMN: DETAILS */}
        <div className="lg:col-span-2 space-y-8">
            {/* HOST INFO */}
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={host.name} data-ai-hint={hostAvatar.imageHint}/>}
                    <AvatarFallback className="text-2xl">{host.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-headline text-2xl">Hosted by {host.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        {host.profile.culturalBackground && <Badge variant="outline">{getFlagEmoji(host.profile.culturalBackground)} {host.profile.culturalBackground}</Badge>}
                        {host.level === 'Superhost' && (
                            <Badge variant="default" className="gap-1 bg-amber-500 hover:bg-amber-600">
                                <Award className="h-4 w-4" /> Superhost
                            </Badge>
                        )}
                         {host.profile.hostingStyles.map(style => (
                            <Badge key={style} variant="secondary">{style}</Badge>
                        ))}
                    </div>
                </div>
            </div>
            <Separator/>
          
          <p className="text-lg leading-relaxed">{experience.description}</p>
          <Separator />

          {/* WHAT YOU'LL DO */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">What you'll do</h3>
            <div className="flex items-start gap-4">
              <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p>You'll be welcomed into {host.name}'s home for a truly local experience. Share stories, learn about their culture, and enjoy a delicious, authentic meal prepared with love.</p>
            </div>
          </div>
          <Separator />
          
          {/* MENU */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">On the Menu</h3>
            <p className="italic text-muted-foreground">"{experience.menu.description}"</p>
            <div className="flex flex-wrap gap-4">
                <Badge variant="secondary">{getFlagEmoji(experience.menu.cuisine)} {experience.menu.cuisine}</Badge>
                <Badge variant="secondary">Spice: {experience.menu.spiceLevel}</Badge>
                {experience.menu.dietary.map(d => <Badge key={d} variant="outline">{d}</Badge>)}
            </div>
          </div>
          <Separator/>
          
          {/* ALLERGENS */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl flex items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-amber-500"/>
                Allergen Information
            </h3>
            <Alert variant="warning">
              <AlertTitle className="font-bold">Please Be Advised</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>This experience takes place in a home kitchen where allergens may be present. While hosts take precautions, cross-contact can occur.</p>
                {experience.menu.allergens && (
                  <div className="p-3 bg-amber-100/50 dark:bg-amber-900/50 rounded-md text-amber-900 dark:text-amber-200">
                    <p className="font-semibold">The host has declared the following potential allergens:</p>
                    <p className="text-sm mt-1">{experience.menu.allergens}</p>
                  </div>
                )}
                <p className="font-semibold">If you have a food allergy or intolerance, please contact the host before booking to discuss your needs.</p>
              </AlertDescription>
            </Alert>
          </div>
          <Separator />

          {/* HOME SETUP */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">About your host's home</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>{host.homeSetup.homeType} with {host.homeSetup.seating} seating</span></div>
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>Pets live here: {host.homeSetup.pets ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><span>Smoking allowed: {host.homeSetup.smoking ? 'Yes' : 'No'}</span></div>
                {host.homeSetup.accessibility && <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><span>{host.homeSetup.accessibility}</span></div>}
                {host.homeSetup.familyFriendly && <div className="flex items-center gap-2"><Baby className="h-5 w-5 text-primary" /><span>Family/Kid friendly</span></div>}
                {host.homeSetup.elevator && <div className="flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5 text-primary" /><span>Elevator in building</span></div>}
                {host.homeSetup.airConditioning && <div className="flex items-center gap-2"><AirVent className="h-5 w-5 text-primary" /><span>Air conditioning</span></div>}
                {host.homeSetup.wifi && <div className="flex items-center gap-2"><Wifi className="h-5 w-5 text-primary" /><span>WiFi available</span></div>}
                {host.homeSetup.taxiNearby && <div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><span>Taxi station nearby</span></div>}
                {host.homeSetup.publicTransportNearby && <div className="flex items-center gap-2"><Bus className="h-5 w-5 text-primary" /><span>Public transport nearby</span></div>}
             </div>
          </div>
          
          {/* HOST ACHIEVEMENTS */}
          {host.profile.achievements && host.profile.achievements.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-headline text-2xl">Host Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  {host.profile.achievements.map((achievement) => (
                    <Badge key={achievement} variant="outline" className="text-base font-normal py-1">
                      <Trophy className="h-4 w-4 mr-2 text-amber-500"/>
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          <Separator />
          
           {/* LOCATION MAP */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">Where you'll be</h3>
            <div className="text-muted-foreground">{localAreaName}, {suburbName}, {countryName}</div>
            <div className="relative aspect-video w-full rounded-lg bg-muted mt-2">
                <ExperienceMap locationQuery={`${localAreaName}, {suburbName}, ${countryName}`} />
            </div>
            <p className="text-sm text-muted-foreground">This is an approximate location. The exact address is provided after booking.</p>
          </div>
          <Separator />
          
          {/* REVIEWS */}
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
        
        {/* RIGHT COLUMN: BOOKING WIDGET */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
             <BookingWidget experience={experience} host={host} />
          </div>
        </div>
      </div>
    </div>
  );
}
