// src/app/actions/get-pets.ts
"use server";

import { Prisma, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const petInclude = {
  user: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
  medicalHistory: true,
  vaccinations: true,
  dewormings: {
    include: {
      product: true,
    },
  },
  appointments: true,
  vacSchedules: true,
  visitHistory: true,
} as const;

type PetWithRelations = Prisma.PetGetPayload<{
  include: typeof petInclude;
}>;

interface GetPetsResponse {
  success: boolean;
  pets?: Array<{
    id: string;
    name: string;
    species: string;
    breed: string;
    ownerName: string;
    isDeceased: boolean | null; 
  }>;
  error?: string;
}

export async function getPets(): Promise<GetPetsResponse> {
  try {
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        isDeceased: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ownerName: pet.user ? `${pet.user.firstName} ${pet.user.lastName}`.trim() : 'Sin dueño',
      isDeceased: pet.isDeceased,
    }));

    return {
      success: true,
      pets: formattedPets,
    };
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return {
      success: false,
      error: "Failed to fetch pets",
    };
  }
}
