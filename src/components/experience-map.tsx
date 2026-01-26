
'use client';

import { MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface ExperienceMapProps {
  locationQuery: string;
}

export function ExperienceMap({ locationQuery }: ExperienceMapProps) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    locationQuery
  )}`;

  return (
    <div className="h-full w-full bg-muted rounded-lg flex flex-col items-center justify-center text-center p-4">
      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-bold text-lg">Map Preview Unavailable</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Map functionality requires a valid Google Maps API key.
      </p>
      <Button asChild>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
          View on Google Maps
        </a>
      </Button>
    </div>
  );
}
