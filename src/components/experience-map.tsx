
'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

// A default center, in case geocoding fails. (Sydney)
const defaultCenter = {
  lat: -33.8688,
  lng: 151.2093,
};

interface ExperienceMapProps {
  locationQuery: string;
}

export function ExperienceMap({ locationQuery }: ExperienceMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Note: For a real production app, you'd use the Geocoding API to turn the `locationQuery`
  // into lat/lng coordinates. This requires an additional API call and state management.
  // For this implementation, we will use a default center point as a placeholder
  // to demonstrate the map component.
  const center = useMemo(() => defaultCenter, []);

  if (loadError) {
    return (
        <div className="h-full w-full bg-destructive/10 text-destructive flex flex-col items-center justify-center rounded-lg p-4 text-center">
            <p className="font-semibold">Error loading map</p>
            <p className="text-xs">Please check the API key and try again.</p>
        </div>
    );
  }

  if (!isLoaded) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  );
}
