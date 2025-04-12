'use client';

import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CartProvider>{children}<Toaster /></CartProvider>;
} 