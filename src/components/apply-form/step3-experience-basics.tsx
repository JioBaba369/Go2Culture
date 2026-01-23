
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Step3ExperienceBasics() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Your Experience Basics</CardTitle>
        <CardDescription>Give your experience a name and some basic details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="experience.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Title</FormLabel>
              <FormControl><Input {...field} placeholder="e.g., Traditional Kerala Home Feast" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="experience.category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="In-Home Dining">In-Home Dining</SelectItem>
                    <SelectItem value="Cooking Class">Cooking Class</SelectItem>
                    <SelectItem value="Art & Craft">Art & Craft</SelectItem>
                    <SelectItem value="Music & Dance">Music & Dance</SelectItem>
                    <SelectItem value="History & Walks">History & Walks</SelectItem>
                    <SelectItem value="Restaurant Experience">Restaurant Experience</SelectItem>
                    <SelectItem value="Special Event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="experience.durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (in minutes)</FormLabel>
                <FormControl><Input {...field} type="number" placeholder="e.g., 180" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
