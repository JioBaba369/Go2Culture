
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface Step2HostProfileProps {
    hostingStyleOptions: readonly { id: string; label: string; description: string; }[];
}

export function Step2HostProfile({ hostingStyleOptions }: Step2HostProfileProps) {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Host Profile</CardTitle>
        <CardDescription>This is what guests will see. Make it personal and welcoming!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="profile.profilePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormDescription>You can upload a real photo later. We'll use a placeholder for now.</FormDescription>
              <FormControl><Input type="file" disabled /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="profile.bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Bio</FormLabel>
              <FormDescription>Tell guests about you, your passions, and your culture.</FormDescription>
              <FormControl><Textarea {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="profile.culturalBackground"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cultural Background</FormLabel>
              <FormDescription>E.g., "Italian", "Cantonese", "Nigerian", "Māori"</FormDescription>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="profile.languages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Languages Spoken</FormLabel>
              <FormDescription>Enter the languages you speak, separated by commas.</FormDescription>
              <FormControl><Input {...field} placeholder="e.g., English, Spanish, Italian" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        <div className="space-y-2">
            <h3 className="font-semibold text-lg">Why would you like to become a Go2Culture host?</h3>
            <p className="text-sm text-muted-foreground">
                We’d love to get to know you better and understand your motivations for hosting. Please carefully consider each option and select the one that best represents you.
            </p>
        </div>
        <FormField
          control={control}
          name="profile.hostingStyles"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 gap-4">
                {hostingStyleOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={control}
                    name="profile.hostingStyles"
                    render={({ field }) => {
                        const isChecked = field.value?.includes(item.label);
                        return (
                            <FormItem className="h-full">
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      // This logic implements single-choice behavior
                                      const newValue = checked ? [item.label] : [];
                                      field.onChange(newValue);
                                    }}
                                    className="sr-only"
                                    id={item.id}
                                  />
                                </FormControl>
                                <Label
                                  htmlFor={item.id}
                                  className={cn(
                                    "flex flex-col items-start justify-start h-full p-4 border-2 rounded-lg cursor-pointer transition-colors",
                                    isChecked ? "border-primary bg-primary/5" : "border-muted bg-transparent hover:bg-muted/50"
                                  )}
                                >
                                  <p className="font-medium text-sm text-foreground">{item.description}</p>
                                </Label>
                            </FormItem>
                        );
                    }}
                  />
                ))}
              </div>
              <FormMessage className="pt-2" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
