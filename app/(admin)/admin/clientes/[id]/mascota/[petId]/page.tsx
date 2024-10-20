// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/page.tsx

import { notFound } from 'next/navigation';
import PetDetailsView from '@/components/Pet/PetDetailsView';
import { getPetDetails } from './getPetDetails';

export default async function PetDetailsPage({
  params,
}: {
  params: { id: string; petId: string };
}) {
  if (!params.id || !params.petId || params.id === 'undefined' || params.petId === 'undefined') {
    notFound();
  }

  try {
    const pet = await getPetDetails(params.id, params.petId);

    if (!pet) {
      notFound();
    }

    return <PetDetailsView pet={pet} />;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    notFound();
  }
}