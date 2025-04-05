'use client';

import { CartProvider } from "@/contexts/CartContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}</CartProvider>;
} 