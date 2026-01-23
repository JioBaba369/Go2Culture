
"use client";

import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { countries, suburbs } from "@/lib/location-data";

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const mainImage = PlaceHolderImages.find(p => p.id === experience.photos.mainImageId);
  const hostAvatar = PlaceHolderImages.find(p => p.id === experience.host.profilePhotoId);

  const countryName = countries.find(c => c.id === experience.location.country)?.name || experience.location.country;
  const suburbName = suburbs.find(s => s.id === experience.location.suburb)?.name || experience.location.suburb;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
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
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={experience.host.name} data-ai-hint={hostAvatar.imageHint} />}
              <AvatarFallback>{experience.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">Hosted by {experience.host.name}</span>
          </div>
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
