
import { Shield, MessageSquare, Heart, Utensils, Calendar, Users } from 'lucide-react';

export default function HostGuidelinesPage() {
    return (
        <div className="py-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Guidelines</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    These guidelines help create a safe, reliable, and respectful community for everyone. All hosts are required to follow them.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                        <Heart className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Be Authentic & Respectful</h3>
                            <p className="text-muted-foreground mt-2">Share your culture genuinely. Treat all guests with respect and warmth, regardless of their background. Represent your food and experience honestly.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MessageSquare className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Communicate Clearly</h3>
                            <p className="text-muted-foreground mt-2">Respond to inquiries and booking requests promptly. Provide clear directions and information about what guests can expect.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Utensils className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Prioritize Food Safety</h3>
                            <p className="text-muted-foreground mt-2">Maintain a clean kitchen and dining area. Follow local food safety regulations and be transparent about ingredients and potential allergens.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Ensure a Safe Environment</h3>
                            <p className="text-muted-foreground mt-2">Your home should be safe and free of hazards. Inform guests about any pets, accessibility issues, or house rules upfront.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Calendar className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Honor Your Bookings</h3>
                            <p className="text-muted-foreground mt-2">Avoid cancellations. Once a booking is confirmed, you are committed to hosting your guests. Cancelling can significantly disrupt their plans.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Users className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold font-headline">Follow Community Standards</h3>
                            <p className="text-muted-foreground mt-2">Go2Culture does not tolerate discrimination, harassment, or illegal activities. All hosts must comply with our community policies and local laws.</p>
                        </div>
                    </div>
                </div>
                 <div className="text-center pt-8 text-sm text-muted-foreground">
                    <p>Failure to adhere to these guidelines may result in a warning, listing suspension, or permanent removal from the Go2Culture platform. We're partners in creating amazing experiences.</p>
                </div>
            </div>
        </div>
    );
}
