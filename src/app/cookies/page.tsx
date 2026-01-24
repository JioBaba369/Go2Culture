'use client';
import { useState, useEffect } from 'react';

export default function CookiesPolicyPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <div className="py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Cookie Policy</h1>
                {lastUpdated && <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>}
            </div>

            <div className="space-y-6 text-muted-foreground">
                <p className="text-lg">This Cookie Policy explains how Go2Culture ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">What are cookies?</h2>
                <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Why do we use cookies?</h2>
                <p>We use first-party cookies for several essential reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. For example, we use cookies to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Maintain your login session.</li>
                    <li>Remember your preferences, like your sidebar visibility preference.</li>
                    <li>Ensure the security of our platform.</li>
                </ul>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">What types of cookies do we use?</h2>
                <h4 className="font-semibold text-foreground">Strictly Necessary Cookies</h4>
                <p>These cookies are essential to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.</p>

                <h4 className="font-semibold text-foreground">Preference Cookies</h4>
                <p>These cookies are used to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in. For example, we use a cookie to remember if you've collapsed the host or admin dashboard sidebar.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">How can you control cookies?</h2>
                <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in our Cookie Consent Banner. Besides that, you can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>

                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Changes to This Cookie Policy</h2>
                <p>We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page. You are advised to review this Cookie Policy periodically for any changes.</p>
                
                <h2 className="font-headline text-2xl font-bold text-foreground pt-4">Contact Us</h2>
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>By email: <a href="mailto:privacy@go2culture.com" className="text-primary hover:underline">privacy@go2culture.com</a></li>
                </ul>
            </div>
        </div>
    );
}
