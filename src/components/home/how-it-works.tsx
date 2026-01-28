
import { Search, Users, Home as HomeIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HowItWorksSection() {
    return (
        <section className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-semibold">How It Works</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">A new way to experience culture, in three simple steps.</p>
            <div className="grid md:grid-cols-3 gap-8 mt-8 max-w-5xl mx-auto">
            <Card className="text-center">
                <CardHeader className="items-center">
                    <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                        <Search className="h-8 w-8" />
                    </div>
                    <CardTitle>Discover</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Find one-of-a-kind cultural experiences hosted by passionate locals in their own homes.</p>
                </CardContent>
            </Card>
            <Card className="text-center">
                <CardHeader className="items-center">
                    <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                        <HomeIcon className="h-8 w-8" />
                    </div>
                    <CardTitle>Book Securely</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Pick a date, book your spot, and get to know your host through our secure platform.</p>
                </CardContent>
            </Card>
            <Card className="text-center">
                 <CardHeader className="items-center">
                    <div className="bg-primary/10 text-primary rounded-full p-4 mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Share a meal, swap stories, and create memories. This is more than just travel—it’s connection.</p>
                </CardContent>
            </Card>
            </div>
        </section>
    );
}
