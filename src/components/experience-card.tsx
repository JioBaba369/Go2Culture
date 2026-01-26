
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Experience, Host } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Utensils } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { countries, suburbs } from "@/lib/location-data";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import { WishlistButton } from "./wishlist-button";

interface ExperienceCardProps {
  experience: Experience;
}

const getFlagEmoji = (name: string): string => {
    if (!name) return '';
    const countryCodeMapping: { [key: string]: string } = {
        'Italian': 'IT', 'Mexican': 'MX', 'Japanese': 'JP', 'Indian': 'IN',
        'Thai': 'TH', 'French': 'FR', 'Vietnamese': 'VN', 'Lebanese': 'LB',
        'Australian': 'AU', 'New Zealand': 'NZ', 'Māori': 'NZ', 'Syrian': 'SY',
        'Australia': 'AU',
    };
    
    const matchedKey = Object.keys(countryCodeMapping).find(key => name.includes(key));
    const code = matchedKey ? countryCodeMapping[matchedKey] : '';

    if (!code) return '';

    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

function ExperienceCardContent({ experience }: ExperienceCardProps) {
  const firestore = useFirestore();
  const hostRef = useMemoFirebase(
    () => firestore && experience.userId ? doc(firestore, 'users', experience.userId, 'hosts', experience.hostId) : null,
    [firestore, experience.userId, experience.hostId]
  );
  // Note: This pattern makes a doc read for every card. For production, denormalizing host data into the experience doc would be more performant.
  const { data: host, isLoading: isHostLoading } = useDoc<Host>(hostRef);

  const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
  const hostAvatar = host ? PlaceHolderImages.find(p => p.id === host.profilePhotoId) : null;

  const countryName = countries.find(c => c.id === experience.location.country)?.name || experience.location.country;
  const suburbName = suburbs.find(s => s.id === experience.location.suburb)?.name || experience.location.suburb;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
      <div className="relative">
        <Link href={`/experiences/${experience.id}`} className="block">
          <div className="relative h-48 w-full">
            {mainImage ? (
              <Image
                src={mainImage.imageUrl}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                data-ai-hint={mainImage.imageHint}
              />
            ) : (
              <div className="bg-muted h-full w-full" />
            )}
          </div>
        </Link>
        <WishlistButton experienceId={experience.id} className="absolute top-2 right-2 z-10" />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <Link href={`/experiences/${experience.id}`} className="block">
              <h3 className="font-headline font-semibold text-lg leading-tight hover:underline">
                {experience.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{suburbName}, {countryName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Utensils className="h-4 w-4 shrink-0" />
            <span>{getFlagEmoji(experience.menu.cuisine)} {experience.menu.cuisine}</span>
          </div>
          {isHostLoading ? <Skeleton className="h-6 w-3/4 mt-2" /> : host && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={host.name} data-ai-hint={hostAvatar.imageHint} />}
                <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">Hosted by {host.name}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="font-bold text-sm">{experience.rating.average}</span>
            <span className="text-sm text-muted-foreground">({experience.rating.count})</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">${experience.pricing.pricePerGuest}</span>
            <span className="text-sm text-muted-foreground"> / person</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


export function ExperienceCard({ experience }: ExperienceCardProps) {
  if (!experience || !experience.id) {
    return null;
  }
  return <ExperienceCardContent experience={experience} />
}
