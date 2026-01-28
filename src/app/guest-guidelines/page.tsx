
'use client';

import { Shield, ArrowRight, Eye, UserCheck, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-muted-foreground">
        {children}
      </CardContent>
    </Card>
);

const RuleListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3">
        <div className="w-5 h-5 flex-shrink-0 mt-1">
            <ArrowRight className="h-5 w-5 text-primary" />
        </div>
        <span>{children}</span>
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

                 <Section title="Consequences">
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
                        <li className="flex items-center justify-center gap-2"><Eye className="h-5 w-5 text-success flex-shrink-0"/>Be curious, not critical</li>
                        <li className="flex items-center justify-center gap-2"><UserCheck className="h-5 w-5 text-success flex-shrink-0"/>Be respectful, not entitled</li>
                        <li className="flex items-center justify-center gap-2"><Smile className="h-5 w-5 text-success flex-shrink-0"/>Be present, not performative</li>
                    </ul>
                    <p className="mt-6 text-sm text-muted-foreground">By joining a Go2Culture experience, you agree to uphold these values.</p>
                    <p className="mt-2 font-semibold">Thank you for being a thoughtful guest.</p>
                </div>
            </div>
        </div>
    );
}
