// app/(admin)/admin/mascotas/[petId]/page.tsx

import PetDetailsView from '@/components/Pet/PetDetailsView';
import { getPetDetails } from './getPetDetails';

export default async function PetDetailsPage({
  params,
}: {
  params: { petId: string };
}) {
  const pet = await getPetDetails(params.petId);

  if (!pet) {
    return <div>Mascota no encontrada</div>;
  }

  return <PetDetailsView pet={pet} />;
}