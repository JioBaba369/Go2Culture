
'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Step2HostProfileProps {
    hostingStyleOptions: readonly { id: string; label: string; }[];
}

export function Step2HostProfile({ hostingStyleOptions }: Step2HostProfileProps) {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Create Your Host Profile</CardTitle>
        <CardDescription>This is what guests will see. Make it personal and welcoming!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <FormField
          control={control}
          name="profile.hostingStyles"
          render={() => (
            <FormItem>
              <FormLabel>Hosting Style</FormLabel>
              <FormDescription>How do you like to host?</FormDescription>
              <div className="grid grid-cols-2 gap-4">
                {hostingStyleOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={control}
                    name="profile.hostingStyles"
                    render={({ field }) => (
                      <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.label)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.label])
                                : field.onChange(field.value?.filter((value) => value !== item.label));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
