// app/(main)/cliente/mascota/[petId]/page.tsx

import { notFound } from 'next/navigation';
import { getPetDetails } from './getPetDetails';
import PetDetailsView from './PetDetailsView';

export default async function PetDetailsPage({
  params,
}: {
  params: { petId: string };
}) {
  try {
    const pet = await getPetDetails(params.petId);
    if (!pet) {
      notFound();
    }
    return <PetDetailsView pet={pet} />;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    notFound();
  }
}