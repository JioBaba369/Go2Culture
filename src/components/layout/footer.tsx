
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-2 space-y-4">
            <Logo className="text-primary" />
             <p className="text-sm text-muted-foreground max-w-xs">
              “Experience culture the way locals live it — around the table, at home, together.”
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
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {year} Go2Culture.com. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
