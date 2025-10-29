'use server';

import { prisma } from "@/lib/prismaDB";
import type { Pet } from "@/types/pet";

export async function getPet(petId: string): Promise<Pet | null> {
  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        MedicalHistory: {
          where: { deletedAt: null }, // Exclude soft-deleted records
          orderBy: { visitDate: 'desc' }
        },
        Vaccination: true,
      },
    });

    if (!pet) {
      return null;
    }

    return pet;
  } catch (error) {
    console.error('Error fetching pet:', error);
    return null;
  }
} 