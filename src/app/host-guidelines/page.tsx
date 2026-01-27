
import { Shield, MessageSquare, Heart, Utensils, Calendar, Users, DollarSign, Image as ImageIcon, Banknote } from 'lucide-react';
import Link from 'next/link';

export default function HostGuidelinesPage() {
    return (
        <div className="py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Host Service Agreement</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Effective Date: October 26, 2024
                </p>
            </div>

            <div className="space-y-6 text-muted-foreground">
                <p className="text-lg">This Host Service Agreement ("Agreement") is a binding legal contract between you ("Host", "you") and Go2Culture ("we", "us", "our"). By becoming a host on our platform, you agree to these terms, our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>, and our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">1. Your Relationship with Go2Culture</h2>
                <p>As a Host, you are an independent third-party contractor, not an employee, partner, or agent of Go2Culture. You have complete control over your schedule, pricing, and how you conduct your experience, provided it aligns with this Agreement and our platform's standards.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">2. Host Responsibilities & Standards</h2>
                <p>To ensure a safe, reliable, and respectful community, all hosts are required to:</p>
                <ul className="space-y-4 mt-4">
                    <li className="flex items-start gap-4">
                        <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Be Authentic & Respectful</h4>
                            <p>Share your culture genuinely. Treat all guests with respect, regardless of their background. Your listings, photos, and descriptions must be accurate and representative of the experience you provide.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-4">
                        <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Prioritise Safety & Hygiene</h4>
                            <p>Maintain a clean and safe environment for your guests. You are solely responsible for complying with all local laws, including food safety and hygiene regulations. Disclose any potential allergens and house rules (e.g., pets, smoking) clearly in your listing.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-4">
                        <Calendar className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Honour Your Commitments</h4>
                            <p>Keep your calendar up to date and honour all confirmed bookings. Cancellations should only occur in cases of genuine emergencies, as they significantly impact guest plans and trust in the platform.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-4">
                        <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Communicate Responsibly</h4>
                            <p>Respond to guest inquiries and booking requests promptly. All booking-related communication and payments must be handled through the Go2Culture platform to ensure security and support for both parties.</p>
                        </div>
                    </li>
                </ul>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">3. Payments & Fees</h2>
                 <ul className="space-y-4 mt-4">
                    <li className="flex items-start gap-4">
                        <DollarSign className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Service Fee</h4>
                            <p>Go2Culture charges a **15% service fee** from the host's payout for each completed booking. This fee covers payment processing, platform maintenance, marketing, and support services. This fee is calculated from the total booking amount and is deducted automatically before the payout is released.</p>
                        </div>
                    </li>
                     <li className="flex items-start gap-4">
                        <Banknote className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-foreground">Payouts</h4>
                            <p>Payouts for a completed experience are typically released to your designated account within 24-72 hours after the experience concludes. You are responsible for providing accurate payout information and for any taxes owed on your earnings.</p>
                        </div>
                    </li>
                </ul>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">4. Content & Licensing</h2>
                 <p>When you upload content (text, photos, videos) to Go2Culture, you grant us a worldwide, non-exclusive, royalty-free licence to use, reproduce, display, and distribute this content for marketing and promotional purposes for the platform. You retain ownership of your content, but you affirm you have the rights to grant us this licence.</p>

                 <h2 className="font-headline text-2xl font-bold text-foreground pt-4">5. Liability & Insurance</h2>
                 <p>You are responsible for your own conduct and the safety of your experience. By hosting, you agree to release and indemnify Go2Culture from any claims, damages, or liabilities arising from your experience. As stated in our <Link href="/trust-and-safety" className="text-primary hover:underline">Trust & Safety</Link> policy, hosts are required to maintain their own adequate insurance, such as homeowner's or renter's insurance that covers commercial hosting activities.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">6. Termination</h2>
                <p>You may unlist your experiences and cease hosting at any time. Go2Culture reserves the right to suspend or terminate your account and listings if you violate this Agreement, our Terms of Service, or fail to meet our community standards. You are still required to honour any bookings that were confirmed prior to termination.</p>

                 <div className="text-center pt-8 text-sm text-muted-foreground">
                    <p>Failure to adhere to this agreement may result in a warning, listing suspension, or permanent removal from the Go2Culture platform.</p>
                </div>
            </div>
        </div>
    );
}
