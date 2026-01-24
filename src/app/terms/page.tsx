'use client';
import { useState, useEffect } from 'react';

export default function TermsAndConditionsPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div className="py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Terms & Conditions</h1>
                {lastUpdated && <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>}
            </div>

            <div className="space-y-6 text-muted-foreground">
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">1. Introduction</h2>
                <p>Welcome to Go2Culture. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">2. User Accounts</h2>
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">3. Bookings and Payments</h2>
                <p>By booking an experience, you agree to pay all applicable fees as described on the experience page. Payments are processed through a secure third-party payment processor. Go2Culture is not responsible for any issues arising from the payment process.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">4. Cancellations and Refunds</h2>
                <p>Cancellation policies are set by the host and are displayed on the experience page. Please review the cancellation policy carefully before booking. Refund eligibility is determined by the host's policy.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">5. Content</h2>
                <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">6. Intellectual Property</h2>
                <p>The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of Go2Culture and its licensors.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">7. Limitation of Liability</h2>
                <p>In no event shall Go2Culture, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">8. Governing Law</h2>
                <p>These Terms shall be governed and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">9. Changes</h2>
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>By email: <a href="mailto:legal@go2culture.com" className="text-primary hover:underline">legal@go2culture.com</a></li>
                </ul>
            </div>
        </div>
    );
}
