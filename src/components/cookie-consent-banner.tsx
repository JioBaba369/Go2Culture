'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'go2culture_cookie_consent';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // This code only runs on the client
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setShowBanner(false);
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 p-4 transition-transform duration-500',
        showBanner ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="max-w-7xl mx-auto">
         <div className="p-6 bg-card border rounded-lg shadow-lg flex flex-col sm:flex-row items-center gap-4">
            <Cookie className="h-10 w-10 text-primary hidden sm:block flex-shrink-0" />
            <div className="flex-grow text-center sm:text-left">
                <h3 className="font-semibold">We Value Your Privacy</h3>
                <p className="text-sm text-muted-foreground">
                    We use cookies to ensure you get the best experience on our website, like remembering your preferences and login status. By continuing to use our site, you agree to our use of cookies. Read more in our{' '}
                    <Link href="/cookies" className="underline hover:text-primary">
                    Cookie Policy
                    </Link>.
                </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
                <Button onClick={handleAccept}>Accept</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
