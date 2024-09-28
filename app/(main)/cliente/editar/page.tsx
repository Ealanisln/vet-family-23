// app/(main)/cliente/editar/page.tsx
"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EditUserProfile from '@/components/Clientes/EditUserProfile'; // Asegúrate de que la ruta sea correcta

export default function EditUserPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  if (!userId) {
    return <div>Error: No se proporcionó ID de usuario</div>;
  }

  return <EditUserProfile userId={userId} />;
}