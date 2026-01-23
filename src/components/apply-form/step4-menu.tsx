
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Step4Menu() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Menu & Food Details</CardTitle>
        <CardDescription>Describe the delicious food you'll be sharing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="experience.menu.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu Description</FormLabel>
              <FormControl><Textarea {...field} rows={4} placeholder="Describe the courses, ingredients, and the story behind the food." /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="experience.menu.cuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine Type</FormLabel>
                <FormControl><Input {...field} placeholder="e.g., Italian, Mexican, Japanese" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="experience.menu.spiceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Spice Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select spice level" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Spicy">Spicy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="experience.menu.allergens"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergens</FormLabel>
              <FormDescription>List any potential allergens present in your kitchen (e.g., nuts, shellfish, dairy).</FormDescription>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
