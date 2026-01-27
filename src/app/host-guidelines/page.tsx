
import { Shield, MessageSquare, Heart, Utensils, Calendar, Users, DollarSign, Image as ImageIcon, Banknote, Search, Home } from 'lucide-react';
import Link from 'next/link';

const GuidelineItem = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <Icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
        <div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <div className="text-muted-foreground mt-1 space-y-2">{children}</div>
        </div>
    </div>
);

export default function HostGuidelinesPage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Welcome to Go2Culture</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Hosting on Go2Culture is not about running a restaurant. It’s about **welcoming guests into your home and culture** through food, conversation, and care.
                </p>
                 <p className="mt-2 text-muted-foreground max-w-3xl mx-auto">
                    This guide explains what guests expect, how to prepare, and how to host with confidence — while keeping everyone safe and comfortable.
                </p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">1. What It Means to Be a Go2Culture Host</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>As a host, you are:</p>
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>A **cultural ambassador**</li>
                            <li>A **home host**, not a commercial kitchen</li>
                            <li>A **guide to your food, traditions, and stories**</li>
                        </ul>
                        <p>Guests choose Go2Culture because they want something **real**, respectful, and human.</p>
                    </div>
                </section>

                 <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">2. Your Experience Listing (Set the Right Expectations)</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <p>Your listing should be honest and clear. Clarity builds trust before guests arrive.</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-foreground">Include:</h4>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>What dishes you will serve</li>
                                    <li>Whether guests eat together or family-style</li>
                                    <li>Approximate duration of the meal</li>
                                    <li>Any dietary limitations you can or cannot accommodate</li>
                                    <li>What guests should expect in your home (children, pets, seating style, etc.)</li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold text-foreground">Avoid:</h4>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>Overpromising</li>
                                    <li>Restaurant-style language</li>
                                    <li>Saying “custom menu” unless you truly offer it</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
                
                 <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">3. Preparing for a Booking</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <p>Once a booking is confirmed:</p>
                         <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-foreground">Before the day</h4>
                                <ul className="list-disc list-inside space-y-1 mt-2">
                                    <li>Review the guest’s booking details</li>
                                    <li>Check dietary notes (if any)</li>
                                    <li>Prepare ingredients in advance</li>
                                    <li>Ensure your dining space is clean, comfortable, and welcoming</li>
                                </ul>
                            </div>
                            <div className="bg-card p-4 rounded-lg">
                                <h4 className="font-semibold text-foreground">Your home does not need to be perfect</h4>
                                <p className="mt-1">It needs to be **clean, safe, and lived-in**. Guests value authenticity, not luxury.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">4. Welcoming Guests Into Your Home</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <h4 className="font-semibold text-foreground">When guests arrive:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Greet them personally</li>
                            <li>Introduce yourself and anyone else present</li>
                            <li>Briefly explain the meal and how it will unfold</li>
                        </ul>
                        <p className="border-l-4 border-primary pl-4 italic">A simple welcome goes a long way: “Thank you for coming into our home. Today we’ll be sharing…”</p>
                    </div>
                </section>
                
                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">5. During the Experience</h2>
                    <div className="space-y-4">
                        <GuidelineItem icon={Utensils} title="Food">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Serve the dishes you described</li>
                                <li>Explain what the food means to you or your culture</li>
                                <li>Invite questions, but don’t pressure conversation</li>
                            </ul>
                        </GuidelineItem>
                         <GuidelineItem icon={MessageSquare} title="Conversation">
                             <ul className="list-disc list-inside space-y-1">
                                <li>Be open, but respectful</li>
                                <li>Share stories if you’re comfortable</li>
                                <li>Allow guests to participate at their own pace</li>
                            </ul>
                        </GuidelineItem>
                        <GuidelineItem icon={Shield} title="Boundaries">
                            <ul className="list-disc list-inside space-y-1">
                                <li>You are not expected to entertain nonstop</li>
                                <li>You are not required to answer personal questions</li>
                                <li>You may gently redirect conversations if needed</li>
                            </ul>
                        </GuidelineItem>
                    </div>
                </section>

                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">6. Safety & Respect (Very Important)</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
                        <div>
                            <h4 className="font-semibold text-foreground">Hosts should:</h4>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Follow basic food hygiene</li>
                                <li>Clearly communicate ingredients</li>
                                <li>Maintain a respectful environment</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">Guests should:</h4>
                            <ul className="list-disc list-inside space-y-1 mt-2">
                                <li>Respect your home</li>
                                <li>Follow **house guidelines**</li>
                                <li>Treat you and your family with courtesy</li>
                            </ul>
                        </div>
                    </div>
                    <p className="text-center mt-6 font-semibold">If anything feels uncomfortable, **you can contact Go2Culture support at any time**.</p>
                </section>

                 <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">7. Photography & Social Media</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <p>Guests may want photos. As a best practice:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Ask for permission before photographing people.</li>
                            <li>It’s okay to say no.</li>
                            <li>You are never required to allow filming or live streaming.</li>
                        </ul>
                         <p className="font-semibold">Your home is not content unless you agree.</p>
                    </div>
                </section>

                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">8. Ending the Experience</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>At the end of the meal, thank guests for coming and let the experience close naturally. There is no obligation to:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Extend the visit</li>
                            <li>Exchange personal contact details</li>
                            <li>Continue beyond the booked time</li>
                        </ul>
                    </div>
                </section>
                
                 <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">9. Reviews & Feedback</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <p>After the experience, guests may leave a review. If you receive feedback, treat it as learning, not judgment.</p>
                        <p>Go2Culture reviews are about **trust and transparency**, not perfection.</p>
                    </div>
                </section>

                <section>
                    <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">10. If Something Goes Wrong</h2>
                     <div className="space-y-4 text-muted-foreground">
                        <p>If there is a late arrival, a misunderstanding, a safety concern, or a no-show, please report it through Go2Culture. Do not try to resolve serious issues alone. We are here to support you.</p>
                    </div>
                </section>

                 <section className="bg-card p-8 rounded-lg text-center">
                    <h2 className="font-headline text-2xl font-bold text-foreground">The Spirit of Hosting</h2>
                     <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
                        <li>Host with pride, not pressure</li>
                        <li>Share culture, not performance</li>
                        <li>Welcome guests, not customers</li>
                    </ul>
                    <p className="mt-6 font-semibold">You are opening your home — that matters.</p>
                    <p className="mt-4 text-muted-foreground">Thank you for being part of Go2Culture.</p>
                </section>
            </div>
        </div>
    );
}
