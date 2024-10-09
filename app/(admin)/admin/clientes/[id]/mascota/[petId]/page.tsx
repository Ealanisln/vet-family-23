// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/page.tsx

import PetDetailsView from '@/components/Pet/PetDetailsView';
import { getPetDetails } from './getPetDetails';

export default async function PetDetailsPage({
  params,
}: {
  params: { id: string; petId: string };
}) {
  const pet = await getPetDetails(params.id, params.petId);

  return <PetDetailsView pet={pet} />;
}