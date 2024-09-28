// app/(admin)/admin/mascotas/[petId]/page.tsx

import { getPetDetails } from './getPetDetails';
import PetDetailsView from './PetDetailsView';

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