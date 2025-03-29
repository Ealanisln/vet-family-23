// src/app/(admin)/admin/pos/layout.tsx
import { Suspense } from 'react';
import { CartProvider } from '@/contexts/CartContext';

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Suspense fallback={<div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>}>
        {children}
      </Suspense>
    </CartProvider>
  );
}