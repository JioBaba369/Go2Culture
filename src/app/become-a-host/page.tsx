
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, DollarSign, Globe, Heart, Home, User, Utensils, Camera, Brush, Music } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function BecomeAHostLandingPage() {
    const heroImage = PlaceHolderImages.find(p => p.id === 'exp-1-thumb-1');

    const requirements = [
        { icon: User, title: 'Your Profile', description: 'A photo, your bio, and your cultural story.' },
        { icon: Home, title: 'Your Place', description: 'Details about your space so guests know what to expect.' },
        { icon: Utensils, title: 'Your Experience', description: 'Your menu, pricing, and what makes it unique.' },
        { icon: Camera, title: 'Photos', description: 'A few snaps of your food and dining area.' },
        { icon: ShieldCheck, title: 'Safety', description: 'Your ID check and agreement to our community safety guidelines.' },
    ];

    const whyHostItems = [
        { icon: Heart, title: 'Share Your Passion', description: 'Turn your passion for cooking and culture into unforgettable experiences for others.' },
        { icon: DollarSign, title: 'Earn Meaningfully', description: 'Set your own prices and schedule. We handle the secure payments for every booking.' },
        { icon: Globe, title: 'Connect With The World', description: 'Meet people from all walks of life and create lasting connections by sharing your traditions.' },
        { icon: ShieldCheck, title: 'Host With Confidence', description: 'Host with confidence. We provide the support, secure payments, and tools to help you thrive.' },
    ]

    return (
        <div className="space-y-16 md:space-y-24 py-12">
            {/* Hero Section */}
            <section className="text-center">
                <h1 className="font-headline text-4xl md:text-6xl font-bold">Share Your Story. Open Your Home. Get Paid.</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Go2Culture is your platform to host guests for authentic meals and cultural events. It could be around your dinner table, at a pop-up, or even in your restaurant.
                </p>
                <Button asChild size="lg" className="mt-8">
                    <Link href="/become-a-host/apply">🚀 Start Your Application</Link>
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">It only takes about 15 minutes to share your story with us.</p>
                <p className="mt-4 text-sm text-muted-foreground">
                    <Link href="/contact" className="underline hover:text-primary">Partner with Go2Culture for your business</Link>
                </p>
            </section>
            
            
            {heroImage && (
                <div className="relative h-96 w-full max-w-5xl mx-auto overflow-hidden rounded-lg">
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        data-ai-hint={heroImage.imageHint}
                    />
                </div>
            )}
            

             {/* What can you host */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What Kind of Story Will You Tell?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Home className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">In-Home Dining</h3>
                        <p className="text-muted-foreground mt-2">Invite guests to your table for a meal cooked from the heart.</p>
                    </div>
                     <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Cooking Classes</h3>
                        <p className="text-muted-foreground mt-2">Teach your family recipes and techniques in a hands-on class.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Brush className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Art & Craft Workshops</h3>
                        <p className="text-muted-foreground mt-2">Share your creative traditions, from pottery and painting to weaving and calligraphy.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Music className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Music, Dance & Storytelling</h3>
                        <p className="text-muted-foreground mt-2">Host an intimate concert, a traditional dance, or a captivating history walk.</p>
                    </div>
                </div>
            </section>

            {/* Why Host Section */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">Why Share Your Story with Us?</h2>
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
                 <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">How It Works</h2>
                 <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">1</div>
                        <h3 className="text-xl font-bold font-headline">Tell Your Story</h3>
                        <p className="text-muted-foreground mt-2">Fill out our simple application, describing your experience and what makes it special.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">2</div>
                        <h3 className="text-xl font-bold font-headline">Welcome Your Guests</h3>
                        <p className="text-muted-foreground mt-2">Manage your bookings, chat with guests, and prepare for a wonderful time.</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                         <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">3</div>
                        <h3 className="text-xl font-bold font-headline">Get Paid Securely</h3>
                        <p className="text-muted-foreground mt-2">Your earnings are transferred safely to you after each successful experience.</p>
                    </div>
                </div>
            </section>

            {/* Requirements Section */}
            <section>
                <h2 className="font-headline text-3xl md:text-4xl font-semibold text-center">What You'll Need to Get Started</h2>
                 <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-center">We've made our application as straightforward as possible. Here’s what to have ready:</p>
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
                <h2 className="font-headline text-3xl md:text-4xl font-semibold">Your Safety Is Our Foundation</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                   We build our community on trust. We require ID verification for all hosts and provide a secure platform for all payments and communication. All hosts must follow our <Link href="/host-guidelines" className="underline hover:text-primary">Host Guidelines</Link> and <Link href="/trust-and-safety" className="underline hover:text-primary">Trust & Safety</Link> standards.
                </p>
                 <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
                   For our hosts in Australia, we'll guide you through the local food safety and compliance requirements.
                </p>
            </section>

            {/* Final CTA Section */}
            <section className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
                 <h2 className="font-headline text-3xl md:text-4xl font-semibold">Ready to Share Your Story?</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/90">
                    Join a global community of incredible hosts sharing their culture and earning on their own terms.
                </p>
                <Button asChild size="lg" variant="secondary" className="mt-8">
                    <Link href="/become-a-host/apply">🚀 Start Your Application</Link>
                </Button>
            </section>
        </div>
    );
}
