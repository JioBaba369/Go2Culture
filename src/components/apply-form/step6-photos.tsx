
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function Step6Photos() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>6. Upload Photos</CardTitle>
        <CardDescription>Real photos perform better. We'll use placeholders for now.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="experience.photos.foodPhotos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Photos (select up to 5)</FormLabel>
              <FormControl><Input type="file" multiple disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="experience.photos.diningAreaPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dining Area Photo</FormLabel>
              <FormControl><Input type="file" disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
