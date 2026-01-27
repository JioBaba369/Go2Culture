
'use client';

import { Shield, MessageSquare, Check, ArrowRight, Eye, UserCheck, Smile } from 'lucide-react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold text-foreground border-b pb-2">{title}</h2>
        <div className="space-y-3 text-muted-foreground">
            {children}
        </div>
    </section>
);

const RuleListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <div className="w-5 h-5 flex-shrink-0 mt-1">
            <ArrowRight className="h-5 w-5 text-primary" />
        </div>
        <span>{children}</span>
    </li>
);

const StandardListItem = ({ icon: Icon, children }: { icon: React.ElementType, children: React.ReactNode }) => (
    <li className="flex items-center justify-center gap-2">
        <Icon className="h-5 w-5 text-success flex-shrink-0"/>
        <span className="font-medium">{children}</span>
    </li>
);

export default function GuestCodeOfConductPage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Guest Code of Conduct</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    When you book a Go2Culture experience, you are entering <strong>someone’s private home</strong>. This Code of Conduct exists to ensure every experience is safe, respectful, and meaningful for hosts and guests alike.
                </p>
            </div>

            <div className="space-y-8">
                <Section title="1. Respect the Home">
                    <p>Guests must:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Treat the host’s home with care and respect.</RuleListItem>
                        <RuleListItem>Follow house guidelines shared in the listing or during the experience.</RuleListItem>
                        <RuleListItem>Respect the host’s personal space and boundaries.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">You are a guest in a home — not a customer in a restaurant.</p>
                </Section>

                <Section title="2. Respect the Host & Household">
                    <p>Guests must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Treat hosts and household members with courtesy.</RuleListItem>
                        <RuleListItem>Be mindful of cultural norms and traditions.</RuleListItem>
                        <RuleListItem>Avoid offensive, discriminatory, or inappropriate behaviour.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Go2Culture experiences are built on <strong>mutual respect</strong>.</p>
                </Section>
                
                 <Section title="3. Honesty & Communication">
                    <p>Guests must:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Provide accurate booking information.</RuleListItem>
                        <RuleListItem>Clearly communicate dietary requirements or allergies in advance.</RuleListItem>
                        <RuleListItem>Arrive on time or inform the host if delayed.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Clear communication helps hosts prepare with care.</p>
                </Section>

                <Section title="4. Food & Dietary Awareness">
                    <p>Guests should:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Ask questions respectfully about ingredients or preparation.</RuleListItem>
                        <RuleListItem>Understand that meals are home-cooked, not restaurant-made.</RuleListItem>
                        <RuleListItem>Respect the host’s stated dietary limitations.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">If you have serious allergies, communicate them clearly before booking.</p>
                </Section>
                
                <Section title="5. Boundaries & Privacy">
                    <p>Guests must:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Respect personal and cultural boundaries.</RuleListItem>
                        <RuleListItem>Avoid intrusive or overly personal questions.</RuleListItem>
                        <RuleListItem>Accept when a host declines a topic or request.</RuleListItem>
                    </ul>
                     <p className="font-semibold text-foreground">Hosts are not required to share more than they are comfortable with.</p>
                </Section>

                <Section title="6. Photography & Media">
                    <p>Guests must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Ask permission before taking photos or videos.</RuleListItem>
                        <RuleListItem>Respect a host’s decision to decline photography.</RuleListItem>
                        <RuleListItem>Never livestream or record without explicit consent.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">A host’s home is private space.</p>
                </Section>

                <Section title="7. Alcohol & Substances">
                     <p>Guests must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Consume alcohol responsibly, if offered.</RuleListItem>
                        <RuleListItem>Never pressure hosts or others to drink.</RuleListItem>
                        <RuleListItem>Refrain from illegal substances during the experience.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Safety and comfort come first.</p>
                </Section>
                
                <Section title="8. Payments & Communication">
                     <p>Guests must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Complete all payments through Go2Culture.</RuleListItem>
                        <RuleListItem>Never request off-platform payments or discounts.</RuleListItem>
                        <RuleListItem>Use Go2Culture messaging for booking-related communication.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">This protects everyone involved.</p>
                </Section>

                <Section title="9. Reviews & Feedback">
                    <p>Guests are encouraged to:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Leave honest, respectful reviews.</RuleListItem>
                        <RuleListItem>Focus feedback on the experience, not personal traits.</RuleListItem>
                        <RuleListItem>Use reviews to help future guests, not to punish hosts.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Go2Culture values fairness and transparency.</p>
                </Section>
                
                <Section title="10. If Something Goes Wrong">
                    <p>If you experience:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>A safety concern</RuleListItem>
                        <RuleListItem>A serious issue or misunderstanding</RuleListItem>
                        <RuleListItem>Behaviour that makes you uncomfortable</RuleListItem>
                    </ul>
                     <p className="font-semibold text-foreground pt-2">Please report it through Go2Culture. Do not escalate conflicts directly in a way that feels unsafe.</p>
                     <p className="font-semibold text-foreground">We are here to support you.</p>
                </Section>

                 <Section title="11. Consequences">
                    <p>Failure to follow this Code of Conduct may result in:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Warnings</RuleListItem>
                        <RuleListItem>Temporary suspension</RuleListItem>
                        <RuleListItem>Removal from the platform in serious cases</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">All situations are reviewed carefully and fairly.</p>
                </Section>

                 <div className="bg-card p-8 rounded-lg text-center">
                    <h2 className="font-headline text-2xl font-bold text-foreground">The Go2Culture Guest Spirit</h2>
                     <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
                        <StandardListItem icon={Eye}>Be curious, not critical</StandardListItem>
                        <StandardListItem icon={UserCheck}>Be respectful, not entitled</StandardListItem>
                        <StandardListItem icon={Smile}>Be present, not performative</StandardListItem>
                    </ul>
                    <p className="mt-6 text-sm text-muted-foreground">By joining a Go2Culture experience, you agree to uphold these values.</p>
                    <p className="mt-2 font-semibold">Thank you for being a thoughtful guest.</p>
                </div>
            </div>
        </div>
    );
}

