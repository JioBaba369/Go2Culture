
'use client';

import { Input } from '@/components/ui/input';
import { type ControllerRenderProps } from 'react-hook-form';

interface PlacePickerWithMapProps {
    field: ControllerRenderProps<any, any>;
    className?: string;
}

// This is a fallback component that replaces the Google Places Autocomplete.
// It renders a simple text input for the address.
export function PlacePickerWithMap({ field, className }: PlacePickerWithMapProps) {
    return (
        <Input 
            placeholder="E.g. 123 Main Street" 
            {...field}
            className={className}
        />
    );
}
