
'use client';

import { ShieldCheck, BookOpen, Heart, Check, ArrowRight } from 'lucide-react';

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

export default function HostCodeOfConductPage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Code of Conduct</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    As a Go2Culture host, you agree to uphold a welcoming, respectful, and safe environment for every guest. This Code of Conduct exists to protect <strong>your home</strong>, <strong>your guests</strong>, and <strong>the spirit of cultural exchange</strong>.
                </p>
            </div>

            <div className="space-y-8">
                <Section title="1. Respect & Inclusion">
                    <p>Hosts must:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Treat all guests with dignity and respect.</RuleListItem>
                        <RuleListItem>Welcome guests regardless of nationality, ethnicity, religion, gender, or background.</RuleListItem>
                        <RuleListItem>Create an environment free from harassment, discrimination, or intimidation.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Go2Culture experiences are built on <strong>mutual respect</strong>.</p>
                </Section>

                <Section title="2. Honesty & Accuracy">
                    <p>Hosts must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Accurately represent their experience, menu, and home setup.</RuleListItem>
                        <RuleListItem>Serve the dishes described in the listing.</RuleListItem>
                        <RuleListItem>Clearly communicate any limitations or changes in advance.</RuleListItem>
                    </ul>
                    <p className="text-sm text-amber-700">Misrepresentation breaks trust and may result in suspension.</p>
                </Section>

                <Section title="3. Safety & Hygiene">
                    <p>Hosts must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Follow basic food hygiene and cleanliness standards.</RuleListItem>
                        <RuleListItem>Clearly disclose ingredients and common allergens.</RuleListItem>
                        <RuleListItem>Maintain a safe and comfortable dining environment.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">You are not required to meet restaurant standards — only <strong>reasonable home safety and care</strong>.</p>
                </Section>
                
                <Section title="4. Boundaries & Privacy">
                    <p>Hosts have the right to:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Set reasonable house guidelines.</RuleListItem>
                        <RuleListItem>Decline personal or intrusive questions.</RuleListItem>
                        <RuleListItem>End conversations that feel uncomfortable.</RuleListItem>
                    </ul>
                    <p className="mt-4">Hosts must:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Respect guest privacy.</RuleListItem>
                        <RuleListItem>Never pressure guests into activities, beliefs, or discussions.</RuleListItem>
                        <RuleListItem>Never record, photograph, or share guest images without consent.</RuleListItem>
                    </ul>
                </Section>

                <Section title="5. Alcohol & Substances">
                     <p>If alcohol is served:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Offer it responsibly.</RuleListItem>
                        <RuleListItem>Never pressure guests to drink.</RuleListItem>
                        <RuleListItem>Follow local laws and cultural norms.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-destructive mt-4">Illegal substances are strictly prohibited during Go2Culture experiences.</p>
                </Section>
                
                <Section title="6. Communication & Payments">
                     <p>Hosts must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Use Go2Culture messaging for all booking-related communication.</RuleListItem>
                        <RuleListItem>Never request or accept off-platform payments.</RuleListItem>
                        <RuleListItem>Never share or request personal contact details for transactional purposes.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">This protects both hosts and guests.</p>
                </Section>
                
                <Section title="7. Reliability & Professional Care">
                    <p>Hosts are expected to:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Honour confirmed bookings.</RuleListItem>
                        <RuleListItem>Be prepared and punctual.</RuleListItem>
                        <RuleListItem>Notify Go2Culture promptly if an issue arises.</RuleListItem>
                    </ul>
                    <p className="text-sm text-amber-700">Repeated cancellations or no-shows may affect hosting status.</p>
                </Section>

                <Section title="8. Photography & Media">
                    <p>Hosts must:</p>
                     <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Ask for consent before photographing guests.</RuleListItem>
                        <RuleListItem>Respect a guest’s decision to decline photos or videos.</RuleListItem>
                        <RuleListItem>Never allow third-party filming without explicit permission.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Your home is private — consent is essential.</p>
                </Section>
                
                <Section title="9. Reporting & Support">
                    <p>Hosts should:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Report safety concerns, misconduct, or serious issues to Go2Culture.</RuleListItem>
                        <RuleListItem>Avoid handling serious disputes alone.</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Go2Culture is here to support you.</p>
                </Section>

                <Section title="10. Consequences">
                    <p>Failure to follow this Code of Conduct may result in:</p>
                    <ul className="list-none space-y-2 pl-4">
                        <RuleListItem>Warnings</RuleListItem>
                        <RuleListItem>Temporary suspension</RuleListItem>
                        <RuleListItem>Removal from the platform in serious cases</RuleListItem>
                    </ul>
                    <p className="font-semibold text-foreground">Actions are reviewed carefully and fairly.</p>
                </Section>

                 <div className="bg-card p-8 rounded-lg text-center">
                    <h2 className="font-headline text-2xl font-bold text-foreground">The Hosting Standard We Stand By</h2>
                     <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
                        <StandardListItem icon={Heart}>Welcome guests, not customers</StandardListItem>
                        <StandardListItem icon={BookOpen}>Share culture, not performance</StandardListItem>
                        <StandardListItem icon={ShieldCheck}>Host with pride, care, and respect</StandardListItem>
                    </ul>
                    <p className="mt-6 text-sm text-muted-foreground">By hosting on Go2Culture, you agree to uphold these standards. Thank you for helping create safe, meaningful cultural experiences.</p>
                </div>
            </div>
        </div>
    );
}
