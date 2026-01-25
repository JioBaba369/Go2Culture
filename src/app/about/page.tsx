
import { Users, Utensils, PiggyBank } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    const heroImageURL = "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxvdXRkb29yJTIwZGlubmVyfGVufDB8fHx8MTc2OTEwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080";

    return (
        <div className="py-12 space-y-16 md:space-y-24">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Go2Culture: Beyond the Restaurant, Into the Heart of Our Global Community</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    We believe that the most meaningful connections don’t happen in commercial spaces. They happen around a kitchen table, in a local home, sharing stories over a meal cooked with love.
                </p>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Our world has transformed into a vibrant multicultural society, especially across the West, where most countries now represent over 150 different nations. Within these borders live millions of migrants who carry the rich heritage, flavors, and traditions of their homelands. Go2Culture was created to unlock these hidden treasures, allowing everyone to experience, indulge, and learn from our newest neighbors.
                </p>
            </div>

            
            <div className="my-12 relative h-[50vh] w-full max-w-5xl mx-auto overflow-hidden rounded-lg">
                <Image
                    src={heroImageURL}
                    alt="A vibrant dinner party"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
            </div>
            

            <div className="max-w-4xl mx-auto space-y-16">
                <div className="text-center">
                    <h2 className="font-headline text-3xl font-bold">Our Story</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        Go2Culture was born from a simple realization: the most authentic way to welcome someone into a community is to sit at their table. Our founders realized that while our cities are diverse, we often live side-by-side without truly knowing one another.
                    </p>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        They saw an opportunity to bridge the gap between long-time residents and migrants eager to share their culture. From a kitchen in London where a Syrian mother shares the secret to perfect kibbeh, to a home in Berlin where a Venezuelan family hosts a joyful dinner, these are the moments of true human connection. We built Go2Culture to turn these stories into shared experiences, moving beyond the "immigrant" label to celebrate the cultural ambassador in everyone.
                    </p>
                </div>
                
                
                <div className="text-center">
                     <h2 className="font-headline text-3xl font-bold">Our Philosophy</h2>
                     <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        We are guided by three core principles that turn a simple meal into a movement for World Peace through Taste and Sharing.
                    </p>
                </div>


                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Authentic Heritage, Not Commercial Food</h3>
                        <p className="text-muted-foreground mt-2">Experience the soul of a nation through recipes passed down through generations. This is food cooked from the heart, offering tastes and stories you won't find in any restaurant.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Genuine Connection, Not a Transaction</h3>
                        <p className="text-muted-foreground mt-2">By entering a home, you participate in a global exchange that dissolves barriers. It’s a two-way street where guests gain a new perspective and migrants share their pride and history.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <PiggyBank className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Boosting the Local Household Economy</h3>
                        <p className="text-muted-foreground mt-2">We are committed to social impact. Every experience directly boosts the household economy of migrant families, providing them with a dignified way to support their lives while enriching the local community.</p>
                    </div>
                </div>

                 <div className="text-center pt-8 bg-card p-8 md:p-12 rounded-lg">
                    <h2 className="font-headline text-3xl font-bold">Join Our Community</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        The world is a tapestry of over 150 cultures living right next door. Whether you are looking to discover the true taste of a new culture or you are a migrant ready to share your heritage with your new home, there is a seat at the table for you.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/discover">Explore Experiences</Link>
                        </Button>
                         <Button size="lg" variant="secondary" asChild>
                            <Link href="/become-a-host">Become a Host</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
