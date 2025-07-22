"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Admin/Sidebar/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DatabaseIndicator } from "@/components/Admin/DatabaseIndicator";

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

export default function AdminLayoutClient({
  children,
  userData,
}: {
  children: React.ReactNode;
  userData: UserData;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {!isHomePage && (
          <AppSidebar user={userData} />
        )}
        <div className="flex-1 w-full">
          {!isHomePage && (
            <header className="sticky top-0 z-10 border-b bg-background px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <DatabaseIndicator />
                </div>
              </div>
            </header>
          )}
          <main className={`${isHomePage ? "p-0" : "p-4 sm:p-6 lg:p-8"}`}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 