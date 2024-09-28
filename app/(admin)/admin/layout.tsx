'use client';

import React from 'react';
import { DesktopSidebar } from '@/components/Admin/Navbar/DesktopSideBar';
import MobileNavigation from '@/components/Admin/Navbar/MobileNavigation';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/admin';

  return (
    <div className="flex min-h-screen">
      {!isHomePage && <DesktopSidebar />}
      <div className="flex-1">
        {!isHomePage && (
          <header className="sticky top-0 z-10 border-b bg-background px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <MobileNavigation />
              {/* Add any other header content here */}
            </div>
          </header>
        )}
        <main className={`${isHomePage ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}