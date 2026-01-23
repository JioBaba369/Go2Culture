
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShieldCheck, DollarSign, Globe, Heart, Home, User, Utensils, Camera, Building, Calendar } from 'lucide-react';

export default function BecomeAHostLandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'exp-1-thumb-1');

    const requirements = [
        { icon: User, title: 'Host Profile', description: 'Your photo, bio, and cultural story.' },
        { icon: Home, title: 'Home & Location', description: 'Details about your space for guest expectations.' },
        { icon: Utensils, title: 'Experience Details', description: 'Your menu, pricing, and what makes it unique.' },
        { icon: Camera, title: 'Photos', description: 'Showcase your food and dining area.' },
        { icon: ShieldCheck, title: 'Verification & Safety', description: 'ID check and agreement to our safety guidelines.' },
    ];

    const whyHostItems = [
        { icon: Heart, title: 'Share Your Passion', description: 'Turn your love for cooking and culture into a memorable experience for others.' },
        { icon: DollarSign, title: 'Earn Meaningfully', description: 'Set your own prices and schedule, and get paid securely for every booking.' },
        { icon: Globe, title: 'Connect With The World', description: 'Meet new people from different backgrounds and share your traditions.' },
        { icon: ShieldCheck, title: 'Host With Confidence', description: 'We provide support, secure payments, and tools to help you succeed.' },
    ]

    return (
        <div className="space-y-16 md:space-y-24 py-12">
            {/* Hero Section */}
            <section className="text-center">
                <h1 className="font-headline text-4xl md:text-6xl font-bold">Open your home. Share your culture. Get paid.</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Go2Culture lets you host guests for authentic cultural meals and events, whether it's in your home, at a pop-up, or in your restaurant.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/become-a-host/apply">🚀 Become a Host</Link>
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">It takes about 15–25 minutes to apply.</p>
            </section>
            
            {heroImage && (
                <div className="relative h-96 w-full max-w-5xl mx-auto overflow-hidden rounded-lg">
                    <Image
                        src={heroImage.imageUrl}
                        alt="A vibrant dinner party"
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                    />
                </div>
            )}

             {/* What can you host */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What Can You Host?</h2>
                <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Home className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">In-Home Dining</h3>
                        <p className="text-muted-foreground mt-2">The classic Go2Culture experience. Welcome guests to your table for a meal.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Building className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Restaurant Experiences</h3>
                        <p className="text-muted-foreground mt-2">Own a restaurant? Offer a special Go2Culture menu or a unique cultural tasting.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Special Events</h3>
                        <p className="text-muted-foreground mt-2">Host a one-off event like a festival dinner, a cooking workshop, or a pop-up.</p>
                    </div>
                </div>
            </section>

            {/* Why Host Section */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Why Host with Go2Culture?</h2>
                 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 max-w-7xl mx-auto">
                    {whyHostItems.map(item => (
                         <div key={item.title} className="flex flex-col items-center text-center">
                            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                            <p className="text-muted-foreground mt-2">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>

             {/* How it works Section */}
            <section className="bg-card rounded-lg p-8 md:p-12">
                 <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">How It Works in 3 Simple Steps</h2>
                 <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">1</div>
                        <h3 className="text-xl font-bold font-headline">Create Your Experience</h3>
                        <p className="text-muted-foreground mt-2">Fill out your application, describing your meal, adding photos, and setting your availability.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">2</div>
                        <h3 className="text-xl font-bold font-headline">Welcome Your Guests</h3>
                        <p className="text-muted-foreground mt-2">Accept bookings that work for you. Message guests and prepare for a great experience.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">3</div>
                        <h3 className="text-xl font-bold font-headline">Get Paid Securely</h3>
                        <p className="text-muted-foreground mt-2">Your earnings are transferred directly to you after each successful experience.</p>
                    </div>
                </div>
            </section>

            {/* Requirements Section */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What You'll Need to Apply</h2>
                 <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">We've streamlined our application to make it as easy as possible. Here’s what to have ready:</p>
                <div className="max-w-4xl mx-auto mt-8 space-y-4">
                    {requirements.map((req) => (
                         <Card key={req.title} className="p-4">
                            <div className="flex items-center gap-4">
                                <req.icon className="h-8 w-8 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-lg">{req.title}</h3>
                                    <p className="text-sm text-muted-foreground">{req.description}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

             {/* Safety Section */}
            <section className="text-center">
                 <ShieldCheck className="h-12 w-12 text-accent mx-auto mb-4"/>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold">Your Safety is Our Priority</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                   We require ID verification for all hosts and provide a secure platform for payments and communication. All hosts must adhere to our <Link href="/host-guidelines" className="underline hover:text-primary">Host Guidelines</Link> and <Link href="/trust-and-safety" className="underline hover:text-primary">Trust & Safety</Link> standards.
                </p>
                 <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
                   Especially for hosts in Australia, we guide you through local compliance requirements.
                </p>
            </section>

            {/* Final CTA Section */}
            <section className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
                 <h2 className="font-headline text-3xl md:text-4xl font-semibold">Ready to Get Started?</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/90">
                    Join a global community of hosts sharing their culture and earning on their own terms.
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link href="/become-a-host/apply">🚀 Apply to Become a Host</Link>
                </Button>
            </section>
        </div>
    );
}

    