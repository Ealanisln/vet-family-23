// src/app/(admin)/admin/pos/layout.tsx
'use client';

import { redirect } from "next/navigation";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily redirect to admin dashboard as POS functionality is disabled
  redirect("/admin");
  
  // This code will not execute due to the redirect above
  return <>{children}</>;
}