
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Globe, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ImpactPage() {
    const impactImageURL = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb21tdW5pdHl8ZW58MHx8fHwxNzcxMjM0NTY3fDA&ixlib=rb-4.1.0&q=80&w=1080";

    const stats = [
        {
            icon: DollarSign,
            value: "$500K+",
            label: "Earned by Hosts",
            description: "Directly boosting the household income of families."
        },
        {
            icon: Globe,
            value: "75+",
            label: "Cultures Represented",
            description: "Celebrating the diverse heritage of our global community."
        },
        {
            icon: Users,
            value: "10,000+",
            label: "Guests Connected",
            description: "Fostering understanding and friendship across borders."
        }
    ];

    return (
        <div className="py-12 space-y-16 md:space-y-24">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">More Than a Meal. It's a Movement.</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    At Go2Culture, we're not just building a platform; we're fostering a global community built on respect, understanding, and shared humanity. Every meal booked is a step toward a more connected world.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center max-w-5xl mx-auto">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="items-center">
                             <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <stat.icon className="h-8 w-8" />
                            </div>
                            <CardTitle className="text-4xl font-bold">{stat.value}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-lg">{stat.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="relative h-96 w-full max-w-5xl mx-auto overflow-hidden rounded-lg">
                <Image
                    src={impactImageURL}
                    alt="A diverse group of people collaborating"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    data-ai-hint="diverse community"
                    priority
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-16">
                 <div className="text-center">
                    <h2 className="font-headline text-3xl font-bold">Our Pillars of Impact</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                       We focus on three core areas to create meaningful, lasting change.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Heart className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Celebrate Authentic Heritage</h3>
                        <p className="text-muted-foreground mt-2">We honour the soul of each culture through home-cooked recipes and traditions passed down across generations—offering flavours, stories, and rituals you won’t find in a typical restaurant.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Create Genuine Human Connection</h3>
                        <p className="text-muted-foreground mt-2">By welcoming guests into local homes, we enable meaningful cultural exchange that breaks down barriers, broadens perspectives, and allows hosts to share their history with pride.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Empower Local Communities</h3>
                        <p className="text-muted-foreground mt-2">Every experience directly supports local households, providing families with a dignified source of income while strengthening and sustaining their communities.</p>
                    </div>
                </div>

                <div className="bg-card p-8 md:p-12 rounded-lg text-center">
                    <blockquote className="text-xl md:text-2xl font-light italic text-foreground">
                        "Hosting on Go2Culture has been life-changing. It's more than just income; it's about sharing my Syrian heritage with my new community in London and seeing the joy on their faces. I feel seen, I feel proud."
                    </blockquote>
                    <cite className="mt-4 block font-semibold not-italic">- Fatima, Go2Culture Host</cite>
                </div>

                <div className="text-center pt-8 bg-primary text-primary-foreground p-8 md:p-12 rounded-lg">
                    <h2 className="font-headline text-3xl font-bold">Be Part of the Impact</h2>
                    <p className="mt-4 text-primary-foreground/90 text-lg max-w-3xl mx-auto">
                        Your next meal could change a life—maybe even your own. Join us in building a more connected and understanding world.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/discover">Explore Experiences</Link>
                        </Button>
                         <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                            <Link href="/become-a-host">Become a Host</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
