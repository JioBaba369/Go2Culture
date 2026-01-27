'use client';

import { Shield, MessageSquare, Check, Square, AlertTriangle, ArrowRight } from 'lucide-react';

const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <div className="w-5 h-5 flex-shrink-0 mt-1">
            <Square className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="text-muted-foreground">{children}</span>
    </li>
);

const DoneItem = ({ children }: { children: React.ReactNode }) => (
     <p className="flex items-start gap-2 pt-2 text-sm text-muted-foreground"><Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5"/> <strong>{children}</strong></p>
)

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section>
        <h2 className="font-headline text-2xl font-bold text-foreground mb-4 border-b pb-2">{title}</h2>
        <div className="space-y-4">
            {children}
        </div>
    </section>
);


export default function HostGuidelinesPage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Your Hosting Checklist</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                   A quick guide to creating a welcoming and successful Go2Culture experience.
                </p>
            </div>

            <div className="space-y-8">

                <Section title="Before the Booking">
                    <ul className="space-y-3">
                        <ChecklistItem>Your listing is accurate and honest</ChecklistItem>
                        <ChecklistItem>Menu, duration, and home setup are clearly described</ChecklistItem>
                        <ChecklistItem>Dietary limits are clearly stated</ChecklistItem>
                    </ul>
                </Section>
                
                <Section title="Before the Day">
                     <ul className="space-y-3">
                        <ChecklistItem>Review booking details and guest notes</ChecklistItem>
                        <ChecklistItem>Confirm date, time, and number of guests</ChecklistItem>
                        <ChecklistItem>Plan and prepare ingredients</ChecklistItem>
                        <ChecklistItem>Dining area is clean, safe, and welcoming</ChecklistItem>
                    </ul>
                    <DoneItem>Your home does <strong>not</strong> need to be perfect — just comfortable and lived-in</DoneItem>
                </Section>
                
                 <Section title="Welcoming Guests">
                     <ul className="space-y-3">
                        <ChecklistItem>Greet guests personally</ChecklistItem>
                        <ChecklistItem>Introduce yourself (and anyone else present)</ChecklistItem>
                        <ChecklistItem>Briefly explain the meal and how it will flow</ChecklistItem>
                    </ul>
                     <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground"><MessageSquare className="h-5 w-5 text-primary flex-shrink-0"/> A warm welcome sets the tone.</p>
                </Section>

                 <Section title="During the Experience">
                     <ul className="space-y-3">
                        <ChecklistItem>Serve the dishes described in your listing</ChecklistItem>
                        <ChecklistItem>Share food stories if you’re comfortable</ChecklistItem>
                        <ChecklistItem>Invite conversation, but don’t force it</ChecklistItem>
                    </ul>
                     <DoneItem>You are not required to entertain constantly</DoneItem>
                     <DoneItem>It’s okay to set or gently protect boundaries</DoneItem>
                </Section>

                 <Section title="Safety & Respect">
                    <ul className="space-y-3">
                        <ChecklistItem>Follow basic food hygiene</ChecklistItem>
                        <ChecklistItem>Clearly communicate ingredients</ChecklistItem>
                        <ChecklistItem>Maintain a respectful environment</ChecklistItem>
                    </ul>
                     <DoneItem>Guests should respect your home and guidelines</DoneItem>
                     <p className="flex items-center gap-2 pt-2 text-sm text-muted-foreground"><AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0"/> Contact Go2Culture support if anything feels uncomfortable.</p>
                </Section>

                <Section title="Photos & Media">
                    <ul className="space-y-3">
                        <ChecklistItem>Ask permission before taking photos</ChecklistItem>
                        <ChecklistItem>It’s okay to say no to photography or filming</ChecklistItem>
                    </ul>
                    <DoneItem>Your home is not content unless you agree</DoneItem>
                </Section>
                
                <Section title="Ending the Experience">
                    <ul className="space-y-3">
                        <ChecklistItem>Thank guests for coming</ChecklistItem>
                        <ChecklistItem>Let the experience end naturally</ChecklistItem>
                    </ul>
                    <DoneItem>No obligation to extend the visit</DoneItem>
                    <DoneItem>No obligation to share personal contact details</DoneItem>
                </Section>

                 <Section title="After the Experience">
                    <ul className="space-y-3">
                        <ChecklistItem>Guests may leave a review</ChecklistItem>
                        <ChecklistItem>Treat feedback as learning, not judgment</ChecklistItem>
                    </ul>
                </Section>

                 <Section title="If Something Goes Wrong">
                     <p className="text-muted-foreground">Late arrival, No-show, Misunderstanding, Safety concern</p>
                    <p className="flex items-center gap-2 pt-2 font-semibold text-primary"><ArrowRight className="h-5 w-5 flex-shrink-0"/> Report it through Go2Culture — don’t handle serious issues alone.</p>
                </Section>

                <div className="bg-card p-8 rounded-lg text-center">
                    <h2 className="font-headline text-2xl font-bold text-foreground">The Go2Culture Hosting Spirit</h2>
                     <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
                        <li className="flex items-center justify-center gap-2"><Check className="h-5 w-5 text-success flex-shrink-0"/> Share culture, not performance</li>
                        <li className="flex items-center justify-center gap-2"><Check className="h-5 w-5 text-success flex-shrink-0"/> Welcome guests, not customers</li>
                        <li className="flex items-center justify-center gap-2"><Check className="h-5 w-5 text-success flex-shrink-0"/> Host with pride, not pressure</li>
                    </ul>
                    <p className="mt-6 font-semibold">Thank you for opening your home — it matters.</p>
                </div>

            </div>
        </div>
    );
}
