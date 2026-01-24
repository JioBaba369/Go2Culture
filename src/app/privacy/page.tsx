'use client';
import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div className="py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                {lastUpdated && <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>}
            </div>

            <div className="space-y-6 text-muted-foreground">
                <p className="text-lg">Go2Culture ("us", "we", or "our") operates the website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Information Collection and Use</h2>
                <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

                <h3 className="font-headline text-xl font-bold text-foreground">Types of Data Collected</h3>
                <h4 className="font-semibold text-foreground">Personal Data</h4>
                <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Address, State, Province, ZIP/Postal code, City</li>
                    <li>Cookies and Usage Data</li>
                </ul>

                <h4 className="font-semibold text-foreground">Usage Data</h4>
                <p>We may also collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Use of Data</h2>
                <p>Go2Culture uses the collected data for various purposes:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>To provide and maintain our Service</li>
                    <li>To notify you about changes to our Service</li>
                    <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                    <li>To provide customer support</li>
                    <li>To gather analysis or valuable information so that we can improve our Service</li>
                    <li>To monitor the usage of our Service</li>
                    <li>To detect, prevent and address technical issues</li>
                </ul>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Data Security</h2>
                <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>By email: <a href="mailto:privacy@go2culture.com" className="text-primary hover:underline">privacy@go2culture.com</a></li>
                </ul>
            </div>
        </div>
    );
}