
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlacePickerWithMap } from '../ui/place-picker-with-map';

export function Step5Location() {
  const { control } = useFormContext();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Location & Home Setup</CardTitle>
        <CardDescription>Your exact address is never shared until a booking is confirmed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <FormField
          control={control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormDescription>Start typing and select your address. The map and postcode will update automatically.</FormDescription>
              <FormControl>
                <PlacePickerWithMap field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="location.postcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postcode</FormLabel>
              <FormControl><Input {...field} placeholder="Auto-filled from address" readOnly /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="homeSetup.homeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Home Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select home type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="homeSetup.seating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seating Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select seating type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Table">Table</SelectItem>
                    <SelectItem value="Floor">Floor</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="homeSetup.maxGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Guests</FormLabel>
              <FormControl><Input {...field} type="number" min="1" max="20" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="homeSetup.accessibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Accessibility Notes</FormLabel>
              <FormDescription>E.g., "There are 3 steps to enter", "Elevator access available".</FormDescription>
              <FormControl><Textarea {...field} rows={2} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
            <FormField control={control} name="homeSetup.pets" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>I have pets</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.smoking" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Smoking is allowed</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.familyFriendly" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Family/Kids friendly</FormLabel></div></FormItem>
            )} />
             <FormField control={control} name="homeSetup.elevator" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Elevator in building</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.airConditioning" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Air conditioning</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.wifi" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>WiFi available</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.publicTransportNearby" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Public transport nearby</FormLabel></div></FormItem>
            )} />
            <FormField control={control} name="homeSetup.taxiNearby" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Taxi station nearby</FormLabel></div></FormItem>
            )} />
        </div>
      </CardContent>
    </Card>
  );
}
