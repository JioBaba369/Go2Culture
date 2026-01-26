
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface Step2HostProfileProps {
    hostingStyleOptions: readonly { id: string; label: string; description: string; }[];
}

export function Step2HostProfile({ hostingStyleOptions }: Step2HostProfileProps) {
  const { control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Host Profile</CardTitle>
        <CardDescription>Tell us your story and share your passion for culture and food.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormField
          control={control}
          name="profile.hostingStyles"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Why would you like to become a Go2Culture host?</FormLabel>
              <FormDescription>
                We’d love to get to know you better and understand your motivations for hosting. Please carefully consider each option and select the one that best represents you.
              </FormDescription>
              <div className="grid grid-cols-1 gap-4 pt-2">
                {hostingStyleOptions.map((item) => (
                  <FormItem key={item.id} className="h-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.label)}
                        onCheckedChange={(checked) => {
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
                        field.value?.includes(item.label) ? "border-primary bg-primary/5" : "border-muted bg-transparent hover:bg-muted/50"
                      )}
                    >
                      <p className="font-medium text-sm text-foreground">{item.description}</p>
                    </Label>
                  </FormItem>
                ))}
              </div>
              <FormMessage className="pt-2" />
            </FormItem>
          )}
        />
        
        <Separator />

        <FormField
          control={control}
          name="profile.expertise"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">What is your expertise and story?</FormLabel>
              <FormDescription>
                Tell us about your culinary background, any experience hosting events and whether you’ve trained in the food industry. We’re keen to know your experience and skill level.
              </FormDescription>
              <FormControl><Textarea {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="profile.hostingExperienceLevel"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-lg font-semibold">How would you describe your hosting experience?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="professional" /></FormControl>
                    <FormLabel className="font-normal">I’m a professional host with experience in similar settings and I’ve received professional training.</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="passionate" /></FormControl>
                    <FormLabel className="font-normal">I’m a passionate host who has casually hosted friends and family.</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Your online profiles</h3>
                <p className="text-sm text-muted-foreground">Do you share your culinary skills on social media? We’d love to see your posts, stories, tweets, writing or other content.</p>
            </div>
            <FormField control={control} name="profile.socialMedia.facebook" render={({ field }) => (
                <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input {...field} placeholder="https://facebook.com/your-profile" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="profile.socialMedia.instagram" render={({ field }) => (
                <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input {...field} placeholder="https://instagram.com/your_handle" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="profile.socialMedia.twitter" render={({ field }) => (
                <FormItem><FormLabel>Twitter / X</FormLabel><FormControl><Input {...field} placeholder="https://x.com/your_handle" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={control} name="profile.socialMedia.tripadvisor" render={({ field }) => (
                <FormItem><FormLabel>TripAdvisor</FormLabel><FormControl><Input {...field} placeholder="Your TripAdvisor profile URL" /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name="profile.website" render={({ field }) => (
                <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} placeholder="https://your-website.com" /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={control} name="profile.socialMedia.other" render={({ field }) => (
                <FormItem><FormLabel>Other (e.g. TikTok, Pinterest)</FormLabel><FormControl><Input {...field} placeholder="Profile URL" /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        
        <Separator />

        <FormField
          control={control}
          name="profile.bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Why would you be the perfect Go2Culture host?</FormLabel>
              <FormDescription>
                Share your story and your food journey. For example, “I was born and raised in this city and I love cooking and entertaining. I believe there are no strangers just friends we haven’t met yet...” This will be shown on your public profile.
              </FormDescription>
              <FormControl><Textarea {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
