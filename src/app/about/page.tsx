
import { Globe, Users, Utensils, Heart, PiggyBank, Handshake } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    const heroImageURL = "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxvdXRkb29yJTIwZGlubmVyfGVufDB8fHx8MTc2OTEwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080";

    return (
        <div className="py-12 space-y-16 md:space-y-24">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Beyond the restaurant, into the heart of culture.</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    We believe the most memorable travel experiences don't happen in packed tourist spots. They happen around a dinner table, in a local's home, sharing stories over a meal cooked with love. That's why we created Go2Culture.
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
                        Go2Culture was born from a simple realization: the best souvenirs are memories. Our founders, a small group of avid travelers, noticed that their most cherished moments weren't from visiting monuments, but from the spontaneous invitations to share meals with local families.
                    </p>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        From a bustling kitchen in Mumbai learning the secret to a perfect chai, to a loud, joyful family dinner in a Naples apartment, these were the moments of true connection. We built Go2Culture to make these authentic experiences accessible to everyone, bridging the gap between curious travelers and proud locals eager to share their world.
                    </p>
                </div>
                
                <div className="text-center">
                    <h2 className="font-headline text-3xl font-bold">Our Mission</h2>
                    <h3 className="mt-2 text-2xl font-semibold text-primary">Building Bridges Through the Power of Food</h3>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        At Go2Culture, our mission is to foster World Peace through Taste and Sharing by celebrating the incredible diversity of our modern multicultural society.
                    </p>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        We recognize that the West has become a tapestry of over 150 different nations. We move beyond the restaurant and into the heart of the home to highlight the stories of migrants who carry the soul of their homelands in their recipes. Our platform is dedicated to turning the act of sharing a meal into a meaningful experience where neighbors can indulge in new flavors and learn from the heritage of those who have journeyed to join our communities.
                    </p>
                </div>
                
                <div>
                    <h3 className="font-headline text-2xl font-bold text-center mb-8">Our Commitment</h3>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center">
                            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <Handshake className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold font-headline">Empowering Migrants</h4>
                            <p className="text-muted-foreground mt-2">To provide a dignified platform where migrants can share their culture and pride, moving from being "newcomers" to being cultural ambassadors.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <PiggyBank className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold font-headline">Boosting the Household Economy</h4>
                            <p className="text-muted-foreground mt-2">To provide a direct path for families to boost their local household economy, ensuring that the financial benefits of cultural exchange go straight into the hands of the people cooking the food.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-bold font-headline">Social Integration</h4>
                            <p className="text-muted-foreground mt-2">To use food as a universal language that dissolves barriers, creating genuine human connections between locals and migrants to foster a more inclusive and peaceful world.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                     <h2 className="font-headline text-3xl font-bold">Our Philosophy</h2>
                     <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        We are guided by three core principles.
                    </p>
                </div>


                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Utensils className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Real Food, Not Restaurant Food</h3>
                        <p className="text-muted-foreground mt-2">Experience the authentic taste of a place through recipes passed down through generations. This is food cooked from the heart.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Genuine Connection, Not a Transaction</h3>
                        <p className="text-muted-foreground mt-2">Go beyond being a customer. Share stories, ask questions, and form lasting memories with your local hosts.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                            <Globe className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Cultural Exchange, Not Tourism</h3>
                        <p className="text-muted-foreground mt-2">We facilitate a two-way street where guests learn about new cultures and hosts share their heritage with the world.</p>
                    </div>
                </div>

                 <div className="text-center pt-8 bg-card p-8 md:p-12 rounded-lg">
                    <h2 className="font-headline text-3xl font-bold">Join Our Community</h2>
                    <p className="mt-4 text-muted-foreground text-lg max-w-3xl mx-auto">
                        Whether you're a traveler seeking a real taste of culture or a passionate cook wanting to share your heritage, there's a seat at the table for you.
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
