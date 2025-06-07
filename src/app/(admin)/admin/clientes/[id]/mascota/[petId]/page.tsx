// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/page.tsx

import { notFound } from 'next/navigation';
import PetDetailsView from '@/components/Pet/PetDetailsView';
import { getPetDetails } from './getPetDetails';

export default async function PetDetailsPage({
  params,
}: {
  params: Promise<{ id: string; petId: string }>;
}) {
  const { id, petId } = await params;
  if (!id || !petId || id === 'undefined' || petId === 'undefined') {
    notFound();
  }

  try {
    const pet = await getPetDetails(id, petId);

    if (!pet) {
      notFound();
    }

    return <PetDetailsView pet={pet} />;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    notFound();
  }
}