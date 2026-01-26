
'use client';
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useState, useEffect } from "react";

export function Footer() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-1 space-y-4">
            <Logo className="text-primary" />
            <p className="text-sm text-muted-foreground">
              Experience culture the way locals live it — around the table, at home, together.
            </p>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Discover</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/discover" className="text-muted-foreground hover:text-foreground">Experiences</Link></li>
              <li><Link href="/cuisines" className="text-muted-foreground hover:text-foreground">Categories</Link></li>
              <li><Link href="/cities" className="text-muted-foreground hover:text-foreground">Cities</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Community</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/become-a-host" className="text-muted-foreground hover:text-foreground">Become a Host</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/impact" className="text-muted-foreground hover:text-foreground">Our Impact</Link></li>
              <li><Link href="/sponsors" className="text-muted-foreground hover:text-foreground">Sponsors</Link></li>
               <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/host-guidelines" className="text-muted-foreground hover:text-foreground">Host Agreement</Link></li>
              <li><Link href="/trust-and-safety" className="text-muted-foreground hover:text-foreground">Trust &amp; Safety</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {year} Go2Culture.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
