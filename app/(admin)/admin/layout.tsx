"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Admin/Sidebar/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {" "}
        {/* Added w-full */}
        {!isHomePage && (
          <AppSidebar>
          </AppSidebar>
        )}
        <div className="flex-1 w-full">
          {" "}
          {/* Added w-full */}
          {!isHomePage && (
            <header className="sticky top-0 z-10 border-b bg-background px-4 py-2 sm:px-6 lg:px-8">
              <SidebarTrigger />

              <div className="flex items-center justify-between">
                {/* Add any other header content here */}
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
