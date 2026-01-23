
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Newspaper } from 'lucide-react';
import { Logo } from '@/components/logo';

const pressMentions = [
    {
        publication: 'Travel + Leisure',
        title: '"The app that\'s changing how we experience the world, one dinner at a time."',
        date: 'October 2023',
        link: '#'
    },
    {
        publication: 'Foodie Weekly',
        title: '"Go2Culture connects you with the heart of a city\'s culinary scene: its home cooks."',
        date: 'September 2023',
        link: '#'
    },
    {
        publication: 'Tech Innovator',
        title: '"A disruptive marketplace for authentic cultural experiences."',
        date: 'August 2023',
        link: '#'
    }
]

export default function PressPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Press & Media</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Information, assets, and media mentions for Go2Culture. For press inquiries, please email press@go2culture.com.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h2 className="font-headline text-3xl font-bold">Media Kit</h2>
                    <p className="text-muted-foreground">
                        Download our media kit for logos, brand guidelines, and high-resolution images.
                    </p>
                    <Button>
                        <Download className="mr-2" /> Download Media Kit (.zip)
                    </Button>
                </div>
                 <div className="space-y-6">
                    <h2 className="font-headline text-3xl font-bold">About Go2Culture</h2>
                     <Logo />
                    <p className="text-muted-foreground">
                        Go2Culture is a global marketplace that connects travelers and curious locals with hosts for authentic, in-home dining experiences. Our mission is to foster cultural understanding through the universal language of food.
                    </p>
                </div>
            </div>

             <div className="max-w-4xl mx-auto mt-16">
                <h2 className="font-headline text-3xl font-bold text-center">Featured In</h2>
                <div className="mt-8 space-y-4">
                    {pressMentions.map((mention) => (
                         <Card key={mention.publication} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="text-xl font-normal italic">"{mention.title}"</CardTitle>
                                <CardDescription className="pt-2 flex justify-between">
                                    <span>- {mention.publication}</span>
                                    <span>{mention.date}</span>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    );
}
