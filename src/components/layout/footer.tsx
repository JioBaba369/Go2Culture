'use client';
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";

export function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <Logo className="text-primary" />
             <p className="text-base font-medium text-muted-foreground max-w-xs border-l-2 border-primary pl-4 italic">
              “Authentic home-cooked meals, hosted by verified cultural homes.”
            </p>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Discover</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/discover" className="text-muted-foreground hover:text-foreground">Experiences</Link></li>
              <li><Link href="/cuisines" className="text-muted-foreground hover:text-foreground">Cuisines</Link></li>
              <li><Link href="/cities" className="text-muted-foreground hover:text-foreground">Cities</Link></li>
              <li><Link href="/what-is-culture" className="text-muted-foreground hover:text-foreground">What is Culture?</Link></li>
              <li><Link href="/sponsors" className="text-muted-foreground hover:text-foreground">Our Sponsors</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Hosting</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/become-a-host" className="text-muted-foreground hover:text-foreground">Share Your Story</Link></li>
              <li><Link href="/host-guidelines" className="text-muted-foreground hover:text-foreground">Host Guidelines</Link></li>
              <li><Link href="/trust-and-safety" className="text-muted-foreground hover:text-foreground">Trust & Safety</Link></li>
            </ul>
          </div>
           <div>
            <h3 className="font-semibold font-headline">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/impact" className="text-muted-foreground hover:text-foreground">Our Impact</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-foreground">Press</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {year} Go2Culture. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
