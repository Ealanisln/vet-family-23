// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/getPetDetails.ts

import { prisma } from '@/lib/prismaDB';

export async function getPetDetails(userId: string, petId: string) {
  if (!userId || !petId) {
    throw new Error('Invalid userId or petId');
  }

  try {
    const pet = await prisma.pet.findUnique({
      where: {
        id: petId,
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        internalId: true,
        name: true,
        species: true,
        breed: true,
        dateOfBirth: true,
        gender: true,
        weight: true,
        microchipNumber: true,
        isNeutered: true,
        isDeceased: true,
        MedicalHistory: true,
        Vaccination: true,
        Deworming: true,
      },
    });

    if (!pet) {
      return null;
    }

    return pet;
  } catch (error) {
    console.error('Error fetching pet details:', error);
    throw error;
  }
}