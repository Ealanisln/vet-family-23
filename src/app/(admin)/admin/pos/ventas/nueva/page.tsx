// src/app/(admin)/admin/pos/ventas/nueva/page.tsx
'use client';

import { useState } from "react";
// REMOVE: import { useCart } from "@/contexts/CartContext";
import SaleForm from "@/components/POS/Sales/SaleForm";

export default function NewSalePage({
}: {
  // REMOVE: searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [isLoading] = useState(false); // REMOVE: setIsLoading

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SaleForm />
    </div>
  );
}
