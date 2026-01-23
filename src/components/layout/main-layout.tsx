
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export function MainLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin');

  if (isAdminPath) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {header}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      {footer}
    </div>
  );
}
