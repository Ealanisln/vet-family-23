// src/app/(admin)/admin/pos/layout.tsx
'use client';

import ClientLayout from "./ClientLayout";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}