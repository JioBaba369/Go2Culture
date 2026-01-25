
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
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
            <h3 className="font-semibold font-headline">Hosting</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/become-a-host" className="text-muted-foreground hover:text-foreground">Become a Host</Link></li>
              <li><Link href="/host-guidelines" className="text-muted-foreground hover:text-foreground">Host Guidelines</Link></li>
              <li><Link href="/trust-and-safety" className="text-muted-foreground hover:text-foreground">Trust &amp; Safety</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link href="/press" className="text-muted-foreground hover:text-foreground">Press</Link></li>
              <li><Link href="/sponsors" className="text-muted-foreground hover:text-foreground">Sponsors &amp; Partners</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {year} Go2Culture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
