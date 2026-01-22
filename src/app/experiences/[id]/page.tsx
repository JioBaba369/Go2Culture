import { notFound } from "next/navigation";
import Image from "next/image";
import { experiences } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Users, MapPin, Languages, Utensils, Award, ShieldCheck, Sparkles, Home, Wind, Accessibility } from "lucide-react";
import { countries, states, suburbs, localAreas } from "@/lib/location-data";

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const experience = experiences.find((exp) => exp.id === params.id);

  if (!experience) {
    notFound();
  }

  const mainImage = PlaceHolderImages.find(p => p.id === experience.mainImageId);
  const hostAvatar = PlaceHolderImages.find(p => p.id === experience.host.avatarImageId);
  
  const countryName = countries.find(c => c.id === experience.country)?.name || experience.country;
  const suburbName = suburbs.find(s => s.id === experience.suburb)?.name || experience.suburb;
  const localAreaName = localAreas.find(l => l.id === experience.localArea)?.name || experience.localArea;

  return (
    <div className="py-8">
      {/* Title Section */}
      <div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold">{experience.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 text-accent fill-accent" />
            <span className="font-bold text-foreground">{experience.rating}</span>
            <span>({experience.reviewCount} reviews)</span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-5 w-5" />
            <span>{localAreaName}, {suburbName}, {countryName}</span>
          </div>
        </div>
      </div>
      
      {/* Image Gallery */}
      <div className="mt-6">
        <div className="relative h-96 w-full overflow-hidden rounded-lg">
           {mainImage && (
            <Image
              src={mainImage.imageUrl}
              alt={experience.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              data-ai-hint={mainImage.imageHint}
            />
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-2xl">Hosted by {experience.host.name}</h2>
              <div className="flex items-center gap-4 text-muted-foreground mt-1">
                <span>{experience.duration}</span>
                <span>·</span>
                <span>Up to {experience.maxGuests} guests</span>
              </div>
            </div>
            <Avatar className="h-16 w-16">
              {hostAvatar && <AvatarImage src={hostAvatar.imageUrl} alt={experience.host.name} data-ai-hint={hostAvatar.imageHint}/>}
              <AvatarFallback>{experience.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <Separator />
          
          {/* Description */}
          <p className="text-lg leading-relaxed">{experience.description}</p>
          <Separator />

          {/* What you'll do */}
           <div className="space-y-4">
            <h3 className="font-headline text-2xl">What you'll do</h3>
            <div className="flex items-start gap-4">
              <Utensils className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <p>You'll be welcomed into {experience.host.name}'s home for a truly local experience. Share stories, learn about their culture, and enjoy a delicious, authentic meal prepared with love.</p>
            </div>
          </div>
          <Separator />
          
          {/* Menu */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">On the Menu</h3>
            <p className="italic text-muted-foreground">"{experience.menu.description}"</p>
            <div className="flex flex-wrap gap-4">
                <Badge variant="secondary">Cuisine: {experience.menu.cuisine}</Badge>
                <Badge variant="secondary">Spice: {experience.menu.spiceLevel}</Badge>
                {experience.menu.dietary.map(d => <Badge key={d} variant="outline">{d}</Badge>)}
            </div>
          </div>
          <Separator />

           {/* Home details */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl">About your host's home</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Home className="h-5 w-5 text-primary" /><span>{experience.houseRules.homeType} with {experience.houseRules.seatingType} seating</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>Pets live here: {experience.houseRules.pets ? 'Yes' : 'No'}</span></div>
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-primary" /><span>Smoking allowed: {experience.houseRules.smoking ? 'Yes' : 'No'}</span></div>
                {experience.houseRules.accessibilityNotes && <div className="flex items-center gap-2"><Accessibility className="h-5 w-5 text-primary" /><span>{experience.houseRules.accessibilityNotes}</span></div>}
             </div>
          </div>
          <Separator />
          
           {/* Reviews */}
          <div>
            <h3 className="font-headline text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-accent fill-accent" />
              {experience.rating} ({experience.reviewCount} reviews)
            </h3>
            <div className="space-y-6 mt-4">
              {experience.reviews.slice(0, 2).map(review => (
                <div key={review.id}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                       <AvatarImage src={`https://picsum.photos/seed/${review.author.name}/100/100`} />
                       <AvatarFallback>{review.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.author.name}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
             <Button variant="outline" className="mt-6">Show all {experience.reviewCount} reviews</Button>
          </div>
        </div>
        
        {/* Booking Widget */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span><span className="text-3xl font-bold">${experience.pricePerGuest}</span> / person</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4"/>
                  <span>{experience.rating} ({experience.reviewCount})</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    className="rounded-md border p-0"
                />
                 <Button size="lg" className="w-full mt-4">Book Now</Button>
                 <p className="text-xs text-center text-muted-foreground mt-2">You won't be charged yet</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
