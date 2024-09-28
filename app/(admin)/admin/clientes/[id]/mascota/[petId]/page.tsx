// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/page.tsx

import { getPetDetails } from './getPetDetails';
import PetDetailsView from './PetDetailsView';

export default async function PetDetailsPage({
  params,
}: {
  params: { id: string; petId: string };
}) {
  const pet = await getPetDetails(params.id, params.petId);

  return <PetDetailsView pet={pet} />;
}