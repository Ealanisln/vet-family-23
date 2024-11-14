'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EditUserProfile from '@/components/Clientes/EditUserProfile';

function UserProfileEditor() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  if (!userId) {
    return <div>Error: No se proporcionó ID de usuario</div>;
  }

  return <EditUserProfile userId={userId} />;
}

export default function EditUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileEditor />
    </Suspense>
  );
}
