// app/(admin)/admin/clientes/[id]/mascotas/[petId]/page.tsx
import { notFound } from 'next/navigation';
import PetDetailsView from '@/components/Pet/PetDetailsView';
import { getPetDetails } from './getPetDetails';
import type { Pet, Deworming, Medicine } from '@/types/pet';

export default async function PetDetailsPage({
  params,
}: {
  params: { id: string; petId: string };
}) {
  try {
    const pet = await getPetDetails(params.id, params.petId);
    
    if (!pet || !pet.dateOfBirth || !pet.createdAt || !pet.updatedAt) {
      notFound();
    }

    // Validar y transformar los datos para asegurar que cumplen con el tipo Pet
    const validatedPet: Pet = {
      ...pet,
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: new Date(pet.dateOfBirth),
      gender: pet.gender,
      weight: Number(pet.weight),
      microchipNumber: pet.microchipNumber,
      internalId: pet.internalId,
      isNeutered: Boolean(pet.isNeutered),
      isDeceased: pet.isDeceased ?? false,
      userId: pet.userId,
      createdAt: new Date(pet.createdAt),
      updatedAt: new Date(pet.updatedAt),
      
      // Validar y transformar el historial médico
      medicalHistory: (pet.medicalHistory ?? []).map(history => ({
        ...history,
        visitDate: new Date(history.visitDate),
        createdAt: new Date(history.createdAt),
        updatedAt: new Date(history.updatedAt),
        prescriptions: Array.isArray(history.prescriptions) 
          ? history.prescriptions 
          : []
      })),
      
      // Validar y transformar las vacunas
      vaccinations: (pet.vaccinations ?? []).map(vaccination => ({
        ...vaccination,
        administrationDate: new Date(vaccination.administrationDate),
        nextDoseDate: new Date(vaccination.nextDoseDate),
        createdAt: new Date(vaccination.createdAt),
        updatedAt: new Date(vaccination.updatedAt)
      })),
      
      // Validar y transformar las desparasitaciones
      dewormings: (pet.dewormings ?? []).map(deworming => {
        // Verificar si el producto está incluido en la desparasitación
        if (!('product' in deworming)) {
          console.warn(`Deworming ${deworming.id} doesn't have product relation loaded`);
          return {
            ...deworming,
            applicationDate: new Date(deworming.applicationDate),
            createdAt: new Date(deworming.createdAt),
            updatedAt: new Date(deworming.updatedAt),
          } as Deworming;
        }

        // Si el producto está incluido, transformar sus fechas
        return {
          ...deworming,
          applicationDate: new Date(deworming.applicationDate),
          createdAt: new Date(deworming.createdAt),
          updatedAt: new Date(deworming.updatedAt),
          product: {
            ...(deworming as any).product,
            expirationDate: (deworming as any).product.expirationDate 
              ? new Date((deworming as any).product.expirationDate) 
              : null,
            createdAt: new Date((deworming as any).product.createdAt),
            updatedAt: new Date((deworming as any).product.updatedAt),
            quantity: Number((deworming as any).product.quantity),
            minStock: (deworming as any).product.minStock 
              ? Number((deworming as any).product.minStock) 
              : null
          } as Medicine
        } as Deworming;
      })
    };

    return <PetDetailsView pet={validatedPet} />;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    notFound();
  }
}