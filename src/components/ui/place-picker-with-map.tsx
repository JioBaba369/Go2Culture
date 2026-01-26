
'use client';

import { Autocomplete, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { useRef, useState, type ComponentProps } from 'react';
import { useFormContext, type ControllerRenderProps } from 'react-hook-form';
import { countries, regions, suburbs } from '@/lib/location-data';
import { Skeleton } from './skeleton';

interface PlacePickerWithMapProps {
    field: ControllerRenderProps<any, any>;
    className?: string;
}

const defaultCenter = {
  lat: -33.8688,
  lng: 151.2093,
};

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem',
  marginTop: '1rem',
};

export function PlacePickerWithMap({ field, className }: PlacePickerWithMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ['places'],
    });

    const { setValue } = useFormContext();
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null);

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();

            if (place.geometry && place.geometry.location) {
                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                };
                setMapCenter(location);
                setMarkerPosition(location);
            }

            if (place && place.address_components) {
                const getComponent = (type: string, nameType: 'long_name' | 'short_name' = 'long_name') => {
                    const component = place.address_components?.find(c => c.types.includes(type));
                    return component ? component[nameType] : '';
                };

                const street_number = getComponent('street_number');
                const route = getComponent('route');
                const fullAddress = `${street_number} ${route}`.trim();
                const postal_code = getComponent('postal_code');
                const countryShort = getComponent('country', 'short_name');
                const stateLong = getComponent('administrative_area_level_1');
                const cityLong = getComponent('locality');
                
                setValue('location.address', fullAddress, { shouldValidate: true, shouldDirty: true });
                setValue('location.postcode', postal_code, { shouldValidate: true, shouldDirty: true });
                field.onChange(fullAddress);

                const countryMatch = countries.find(c => c.id === countryShort);
                if (countryMatch) {
                    setValue('location.country', countryMatch.id, { shouldValidate: true, shouldDirty: true });
                    
                    setTimeout(() => {
                        const regionMatch = regions.find(r => r.name === stateLong && r.countryId === countryMatch.id);
                        if (regionMatch) {
                            setValue('location.region', regionMatch.id, { shouldValidate: true, shouldDirty: true });

                            setTimeout(() => {
                                const suburbMatch = suburbs.find(s => s.name === cityLong && s.regionId === regionMatch.id);
                                if (suburbMatch) {
                                    setValue('location.suburb', suburbMatch.id, { shouldValidate: true, shouldDirty: true });
                                }
                            }, 0);
                        }
                    }, 0);
                }
            }
        }
    };

    if (loadError) {
        return <Input value="Could not load Google Maps" disabled />;
    }

    if (!isLoaded) {
        return <Skeleton className="h-10 w-full" />;
    }

    return (
        <div>
            <Autocomplete
                onLoad={(ref) => (autocompleteRef.current = ref)}
                onPlaceChanged={onPlaceChanged}
                fields={['address_components', 'geometry']}
                types={['address']}
            >
                <Input 
                    placeholder="Start typing your full address..." 
                    {...field}
                    className={className}
                />
            </Autocomplete>
            <div style={mapContainerStyle}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
                    center={mapCenter}
                    zoom={15}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
            </div>
        </div>
    );
}

