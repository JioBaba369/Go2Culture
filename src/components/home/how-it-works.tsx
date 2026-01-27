
import { Search, Users, Home as HomeIcon } from "lucide-react";

export function HowItWorksSection() {
    return (
        <section className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-semibold">How It Works</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">A new way to experience culture, in three simple steps.</p>
            <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Discover</h3>
                <p className="text-muted-foreground mt-2">Find one-of-a-kind cultural experiences hosted by passionate locals in their own homes.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                <HomeIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Book Securely</h3>
                <p className="text-muted-foreground mt-2">Pick a date, book your spot, and get to know your host through our secure platform.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-headline">Experience</h3>
                <p className="text-muted-foreground mt-2">Share a meal, swap stories, and create memories. This is more than just travel—it’s connection.</p>
            </div>
            </div>
        </section>
    );
}
