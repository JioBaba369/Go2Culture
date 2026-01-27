
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MainLayout } from '@/components/layout/main-layout';
import { FirebaseClientProvider } from '@/firebase';
import { CookieConsentBanner } from '@/components/cookie-consent-banner';
import { cn } from '@/lib/utils';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('antialiased font-sans')} style={{ '--font-sans': 'Inter, sans-serif', '--font-headline': 'Poppins, sans-serif' } as React.CSSProperties}>
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
