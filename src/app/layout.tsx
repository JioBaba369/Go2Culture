
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MainLayout } from '@/components/layout/main-layout';
import { FirebaseClientProvider } from '@/firebase';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { cn } from '@/lib/utils';
import { Lora, Inter } from 'next/font/google';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-headline',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Go2Culture - Experience Authentic Food & Culture.',
  description: 'Experience Authentic Food & Culture.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('antialiased font-sans', lora.variable, inter.variable)}>
        <FirebaseClientProvider>
          <MainLayout header={<Header />} footer={<Footer />}>
            {children}
          </MainLayout>
          <Toaster />
          <CookieConsentBanner />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
