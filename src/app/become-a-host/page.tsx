
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, User, Shield, Home, MapPin, Utensils, Calendar, Camera, FileText, Banknote, Rocket, Award, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const Section = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <section className={cn("py-12 md:py-16", className)}>{children}</section>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-headline text-3xl md:text-4xl font-bold text-center">{children}</h2>
);

const SectionDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto text-center">{children}</p>
);

const CheckListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <Check className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
        <span className="text-muted-foreground">{children}</span>
    </li>
);

export default function BecomeAHostInfoPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'host-cta');

    const applicationSteps = [
        { icon: User, title: "Basic Account Details", content: "Full name, email, mobile number, and your location (Country, State, City/Suburb)." },
        { icon: Shield, title: "Identity Verification", content: "To keep everyone safe, we require a government-issued ID (like a passport or driver’s license) and a selfie for verification. Your documents are securely stored and never shared publicly." },
        { icon: Heart, title: "Host Profile Information", content: "This is what guests see! You'll provide a profile photo, a short bio about your story and culture, languages you speak, and your unique hosting style." },
        { icon: MapPin, title: "Home & Location Details", content: "Describe your home (house/apartment), seating style, max guests, and any accessibility notes. Your exact address is kept private until a booking is confirmed." },
        { icon: Utensils, title: "Experience & Menu Details", content: "Describe the delicious experience you'll offer. Include a title, description, duration, price, and all the crucial menu details like cuisine, dietary options, and allergens." },
        { icon: Camera, title: "Photos", content: "Guests love photos! You'll need to upload 2-5 photos of your food and at least one of your dining area. Real photos work best." },
    ];

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <section className="relative -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="w-full h-[50vh] md:h-[60vh]">
                {heroImage && (
                    <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint={heroImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-black/60" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-lg">
                        Become a Go2Culture Host
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg md:text-xl text-neutral-200 drop-shadow-md">
                       Open your home. Share your culture. Get paid.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/become-a-host/apply">Start Your Application</Link>
                    </Button>
                    <p className="text-xs mt-2 text-neutral-300">It takes about 15–25 minutes to apply.</p>
                </div>
            </section>

            {/* Who can host */}
            <Section>
                <div className="container max-w-5xl mx-auto">
                    <SectionTitle>Who Can Become a Host?</SectionTitle>
                    <SectionDescription>
                        You don’t need to be a professional chef. You just need a passion for real food, real culture, and real hospitality.
                    </SectionDescription>
                    <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        <CheckListItem>Are **18 years or older**.</CheckListItem>
                        <CheckListItem>Can host guests **in your own home**.</CheckListItem>
                        <CheckListItem>Enjoy sharing **home-cooked food and your culture**.</CheckListItem>
                        <CheckListItem>Meet **basic food safety and hygiene standards**.</CheckListItem>
                    </ul>
                </div>
            </Section>

            <div className="bg-card">
              <Section>
                  <div className="container max-w-5xl mx-auto">
                      <SectionTitle>How It Works</SectionTitle>
                      <SectionDescription>
                          From application to your first hosting experience, here’s what to expect.
                      </SectionDescription>
                      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto mt-12">
                          <AccordionItem value="item-1">
                              <AccordionTrigger className="text-lg font-semibold">1. Create Your Listing</AccordionTrigger>
                              <AccordionContent className="pt-2 text-base text-muted-foreground">
                                  You'll provide information about yourself, your home, and the unique cultural experience you want to offer. This includes everything from menu details to photos of your space.
                              </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                              <AccordionTrigger className="text-lg font-semibold">2. Submit for Review</AccordionTrigger>
                              <AccordionContent className="pt-2 text-base text-muted-foreground">
                                  Our team reviews every application to ensure it meets our safety and quality standards. We check your profile, menu, and photos to make sure guests will have a great experience.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-3">
                              <AccordionTrigger className="text-lg font-semibold">3. Get Approved & Go Live</AccordionTrigger>
                              <AccordionContent className="pt-2 text-base text-muted-foreground">
                                  Once approved, your experience goes live on Go2Culture! You can set your availability and start accepting bookings from guests around the world.
                              </AccordionContent>
                          </AccordionItem>
                           <AccordionItem value="item-4">
                              <AccordionTrigger className="text-lg font-semibold">4. Host & Get Paid</AccordionTrigger>
                              <AccordionContent className="pt-2 text-base text-muted-foreground">
                                 Welcome guests into your home, share your culture, and create unforgettable memories. You'll receive your payment securely after each completed experience.
                              </AccordionContent>
                          </AccordionItem>
                      </Accordion>
                  </div>
              </Section>
            </div>

            {/* What you'll need */}
            <Section>
                <div className="container max-w-5xl mx-auto">
                    <SectionTitle>What You'll Need to Apply</SectionTitle>
                    <SectionDescription>
                        Gathering this information beforehand will make your application process smooth and fast.
                    </SectionDescription>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {applicationSteps.map((step) => (
                           <Card key={step.title} className="bg-card/50">
                               <CardHeader className="flex flex-row items-center gap-4">
                                   <step.icon className="h-8 w-8 text-primary" />
                                   <CardTitle className="text-xl font-headline">{step.title}</CardTitle>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-muted-foreground">{step.content}</p>
                               </CardContent>
                           </Card>
                       ))}
                        <Card className="bg-card/50">
                               <CardHeader className="flex flex-row items-center gap-4">
                                   <ShieldCheck className="h-8 w-8 text-primary" />
                                   <CardTitle className="text-xl font-headline">Compliance & Legal</CardTitle>
                               </CardHeader>
                               <CardContent>
                                   <p className="text-muted-foreground">Especially for hosts in Australia, you'll need to answer a few questions about local food safety regulations to ensure you're compliant.</p>
                               </CardContent>
                           </Card>
                    </div>
                </div>
            </Section>

            <div className="bg-card">
              <Section>
                  <div className="container max-w-3xl mx-auto text-center">
                     <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                     <SectionTitle>Ready to Get Started?</SectionTitle>
                     <p className="mt-4 text-lg text-muted-foreground">
                        Join a global community of hosts sharing their culture and passion for food. Create your listing today and start your hosting journey.
                     </p>
                      <Button asChild size="lg" className="mt-8">
                          <Link href="/become-a-host/apply">Start Your Application</Link>
                      </Button>
                  </div>
              </Section>
            </div>

        </div>
    );
}
