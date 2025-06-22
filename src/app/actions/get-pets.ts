// src/app/actions/get-pets.ts

'use server'

import { PrismaClient } from '@prisma/client'

// Type guard for Prisma errors
function isPrismaError(error: unknown): error is { code: string } {
  return error !== null && typeof error === 'object' && 'code' in error;
}

// Custom error class
class ServerActionError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ServerActionError';
  }
}

// Implement singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// --- Definición de la interfaz Pet (resultado final) ---
export interface Pet {
  id: string;
  internalId: string | null;
  name: string;
  species: string;
  breed: string;
  userId: string;
  ownerName: string; // Calculado
  isDeceased: boolean;
  isArchived: boolean;
  dateOfBirth: Date | null;
  gender: string;
  weight: number | null;
  microchipNumber: string | null;
  isNeutered: boolean | null;
}

// --- Tipo intermedio para los datos crudos de Prisma ---
// Coincide con la cláusula 'select' usada en las queries
type PrismaPetData = {
  id: string;
  internalId: string | null;
  name: string;
  species: string;
  breed: string;
  userId: string;
  isDeceased: boolean;
  isArchived: boolean;
  dateOfBirth: Date | null;
  gender: string;
  weight: number | null;
  microchipNumber: string | null;
  isNeutered: boolean | null;
  user: { // Puede ser null si la relación es opcional
    firstName: string | null;
    lastName: string | null;
  } | null;
};

// --- Tipo de resultado para las funciones get ---
export type GetPetsResult =
  | { success: true; pets: Pet[] }
  | { success: false; error: string; pets: never[] }

// --- Helper function para formatear nombre del dueño ---
function formatOwnerName(firstName: string | null, lastName: string | null): string {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
}

// --- Helper function para formatear Pet desde Prisma ---
// Usa el tipo específico PrismaPetData en lugar de any
function formatPrismaPet(prismaPet: PrismaPetData): Pet {
  if (!prismaPet) {
      // Este caso es improbable con findMany, pero es una guarda segura
      console.warn("formatPrismaPet recibió un valor nulo o indefinido.");
      // Devolver un valor que TypeScript acepte como tipo Pet o lanzar error
      // Devolver null aquí causaría problemas donde se usa .map(formatPrismaPet)
      // Podríamos devolver un objeto Pet "vacío" o inválido, pero es mejor asegurar que no pase.
      // Lanzar un error podría ser lo más correcto si esto NUNCA debería ocurrir.
      throw new Error("Received invalid data in formatPrismaPet");
      // O, si se permite un estado inválido temporalmente:
      // return { id: '', name: 'Invalid Pet Data', ... } as Pet;
  }

  const ownerName = prismaPet.user
    ? formatOwnerName(prismaPet.user.firstName, prismaPet.user.lastName)
    : 'N/A';

  return {
    id: prismaPet.id,
    internalId: prismaPet.internalId,
    name: prismaPet.name,
    species: prismaPet.species,
    breed: prismaPet.breed,
    userId: prismaPet.userId,
    ownerName: ownerName,
    isDeceased: prismaPet.isDeceased,
    isArchived: prismaPet.isArchived,
    dateOfBirth: prismaPet.dateOfBirth,
    gender: prismaPet.gender,
    weight: prismaPet.weight,
    microchipNumber: prismaPet.microchipNumber,
    isNeutered: prismaPet.isNeutered,
  };
}

// --- Acción para obtener TODAS las mascotas ---
export async function getPets(): Promise<GetPetsResult> {
  console.log("Server Action: getPets called");
  try {
    // Prisma ahora inferirá el tipo basado en 'select', pero podemos ser explícitos
    const petsData: PrismaPetData[] = await prisma.pet.findMany({
      select: {
        id: true,
        internalId: true,
        name: true,
        species: true,
        breed: true,
        userId: true,
        isDeceased: true,
        isArchived: true,
        dateOfBirth: true,
        gender: true,
        weight: true,
        microchipNumber: true,
        isNeutered: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedPets = petsData.map(formatPrismaPet);
    console.log(`Server Action: getPets returning ${formattedPets.length} pets.`);
    return {
      success: true,
      pets: formattedPets
    };

  } catch (error: unknown) {
    console.error('Server Action Error in getPets:', error);
    if (error instanceof ServerActionError) throw error;
    if (isPrismaError(error)) {
      console.error('Prisma error code in getPets:', error.code);
    }
    return {
      success: false,
      error: 'Error al obtener la lista de mascotas.',
      pets: []
    };
  }
}

// --- Acción para obtener mascotas por User ID ---
export async function getPetsByUserId(userId: string): Promise<GetPetsResult> {
  console.log(`Server Action: getPetsByUserId called for userId: ${userId}`);

  if (!userId) {
      console.warn("Server Action: getPetsByUserId called without userId.");
      return { success: true, pets: [] };
  }

  try {
    // Prisma inferirá el tipo, pero podemos ser explícitos
    const petsData: PrismaPetData[] = await prisma.pet.findMany({
      where: {
        userId: userId
      },
      select: { // Misma selección que getPets para consistencia
        id: true,
        internalId: true,
        name: true,
        species: true,
        breed: true,
        userId: true,
        isDeceased: true,
        isArchived: true,
        dateOfBirth: true,
        gender: true,
        weight: true,
        microchipNumber: true,
        isNeutered: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedPets = petsData.map(formatPrismaPet);
    console.log(`Server Action: getPetsByUserId returning ${formattedPets.length} pets for userId: ${userId}.`);
    return {
      success: true,
      pets: formattedPets
    };

  } catch (error: unknown) {
    console.error(`Server Action Error in getPetsByUserId for userId ${userId}:`, error);
    if (error instanceof ServerActionError) throw error;
    if (isPrismaError(error)) {
      console.error('Prisma error code in getPetsByUserId:', error.code);
    }
    return {
      success: false,
      error: `Error al obtener las mascotas para este cliente.`,
      pets: []
    };
  }
}