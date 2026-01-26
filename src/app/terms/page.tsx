
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div className="py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Terms of Service</h1>
                {lastUpdated && <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>}
            </div>

            <div className="space-y-6 text-muted-foreground">
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">1. Introduction</h2>
                <p>Welcome to Go2Culture ("we", "us", "our"). These Terms of Service ("Terms") govern your access to and use of our website, services, and platform (collectively, the "Service"). By creating an account or using our Service, you agree to be bound by these Terms, our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and for hosts, our <Link href="/host-guidelines" className="text-primary hover:underline">Host Service Agreement</Link>.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">2. User Accounts</h2>
                <p>To use certain features of our Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep this information updated. You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">3. Guest Policy & Responsibilities</h2>
                <p>As a guest, you are a vital part of our community. You agree to:</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                    <li>**Respect Your Host and Their Home:** Treat your host's home with care and respect. Follow any house rules provided by the host.</li>
                    <li>**Communicate Respectfully:** All communications with hosts should be polite and related to the booking. Harassment or discriminatory language will not be tolerated.</li>
                    <li>**Book Accurately:** Provide accurate information about the number of guests in your party and any dietary needs or allergies.</li>
                    <li>**Adhere to Platform Rules:** Do not attempt to communicate or transact with hosts outside of the Go2Culture platform before a booking is confirmed.</li>
                </ul>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">4. Bookings, Payments, and Cancellations</h2>
                <p>When you book an experience, you are entering into a direct contract with the Host. You agree to pay all fees associated with the booking. Our role is to facilitate this connection and process payments securely. Cancellation and refund policies are set by the Host and are clearly displayed on the experience page. Please review these policies carefully before booking.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">5. Content on Go2Culture</h2>
                <p>Our Service allows you to post content, such as reviews. You are responsible for the content you post, ensuring it is legal, reliable, and appropriate. By posting, you grant Go2Culture a license to use this content in connection with the Service. We reserve the right, but not the obligation, to monitor and remove content that we determine, in our sole discretion, violates our policies or is otherwise harmful.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">6. Dispute Resolution</h2>
                <p>Go2Culture encourages open communication between guests and hosts to resolve any issues. If a dispute arises that cannot be resolved directly, you may contact our support team. We may, at our discretion, assist in mediating the dispute, but we are not obligated to do so and will not be a party to any final resolution.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">7. Termination</h2>
                <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">8. Limitation of Liability</h2>
                <p>In no event shall Go2Culture, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service, your interaction with any hosts or guests, or any experiences you attend. Our platform is a venue, and we are not a party to the agreement between guest and host.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">9. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">10. Changes to These Terms</h2>
                <p>We reserve the right to modify these Terms at any time. If we make material changes, we will provide you with notice, such as by sending an email or by posting a notice on our Service. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: <a href="mailto:legal@go2culture.com" className="text-primary hover:underline">legal@go2culture.com</a></p>
            </div>
        </div>
    );
}
