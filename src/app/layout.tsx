
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MainLayout } from '@/components/layout/main-layout';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Go2Culture - Go where culture lives.',
  description: 'Experience culture the way locals live it — around the table, at home, together.',
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
      </head>
      <body className="antialiased">
        <FirebaseClientProvider>
          <MainLayout header={<Header />} footer={<Footer />}>
            {children}
          </MainLayout>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
