
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function Step8Pricing() {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>8. Pricing & Final Agreements</CardTitle>
        <CardDescription>Set your price and agree to our guidelines to submit your application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="experience.pricing.pricePerGuest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Guest (USD)</FormLabel>
              <FormControl><Input {...field} type="number" min="10" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="compliance.agreeToFoodSafety"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I acknowledge my food safety responsibilities.</FormLabel>
                <FormDescription>I understand that I am responsible for preparing food safely and in accordance with local laws. Go2Culture is a platform, not a food provider.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="compliance.guidelinesAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange}/></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I agree to the Go2Culture Host Guidelines.</FormLabel>
                <FormDescription>This includes respecting guests, maintaining hygiene, and following all platform rules.</FormDescription>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
