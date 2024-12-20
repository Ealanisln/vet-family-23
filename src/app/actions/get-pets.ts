'use server'

import { PrismaClient, Prisma } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid';

// Type guard for Prisma errors
function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
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

// Types
type PetWithUser = Prisma.PetGetPayload<{
  select: {
    id: true;
    internalId: true;
    name: true;
    species: true;
    breed: true;
    userId: true;
    isDeceased: true;
    dateOfBirth: true;
    gender: true;
    weight: true;
    microchipNumber: true;
    isNeutered: true;
    user: {
      select: {
        firstName: true;
        lastName: true;
      }
    }
  }
}>;

export interface Pet {
  id: string;
  internalId: string | null;
  name: string;
  species: string;
  breed: string;
  userId: string;
  ownerName: string;
  isDeceased: boolean;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  isNeutered: boolean;
}

type GetPetsResult = 
  | { success: true; pets: Pet[] }
  | { success: false; error: string; pets: never[] }

// Server actions
export async function getPets(): Promise<GetPetsResult> {
  try {
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        internalId: true,
        name: true,
        species: true,
        breed: true,
        userId: true,
        isDeceased: true,
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

    const formattedPets = pets.map(pet => ({
      id: pet.id,
      internalId: pet.internalId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      userId: pet.userId,
      ownerName: formatOwnerName(pet.user.firstName, pet.user.lastName),
      isDeceased: pet.isDeceased,
      dateOfBirth: pet.dateOfBirth,
      gender: pet.gender,
      weight: pet.weight,
      microchipNumber: pet.microchipNumber,
      isNeutered: pet.isNeutered
    }));

    return { 
      success: true, 
      pets: formattedPets 
    };

  } catch (error: unknown) {
    console.error('Failed to fetch pets:', error);
    
    if (error instanceof ServerActionError) throw error;
    
    if (isPrismaError(error)) {
      console.error('Prisma error code:', error.code);
    }

    return { 
      success: false, 
      error: 'Failed to fetch pets', 
      pets: [] 
    };
  }
}

// Helper function to format owner name
function formatOwnerName(firstName: string | null, lastName: string | null): string {
  return `${firstName || ''} ${lastName || ''}`.trim() || 'N/A';
}

// Types for creating a pet
export interface CreatePetData {
  name: string;
  species: string;
  breed: string;
  userId: string;
  isDeceased?: boolean;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber?: string | null;
  isNeutered?: boolean;
  internalId?: string | null;
}

export async function createPet(data: CreatePetData): Promise<Pet> {
  try {
    const pet = await prisma.pet.create({
      data: {
        id: uuidv4(), // Generate a UUID for the id field
        internalId: data.internalId || null,
        name: data.name,
        species: data.species,
        breed: data.breed,
        userId: data.userId,
        isDeceased: data.isDeceased ?? false,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        weight: data.weight,
        microchipNumber: data.microchipNumber ?? null,
        isNeutered: data.isNeutered ?? false
      },
      select: {
        id: true,
        internalId: true,
        name: true,
        species: true,
        breed: true,
        userId: true,
        isDeceased: true,
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
      }
    });

    return {
      id: pet.id,
      internalId: pet.internalId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      userId: pet.userId,
      ownerName: formatOwnerName(pet.user.firstName, pet.user.lastName),
      isDeceased: pet.isDeceased,
      dateOfBirth: pet.dateOfBirth,
      gender: pet.gender,
      weight: pet.weight,
      microchipNumber: pet.microchipNumber,
      isNeutered: pet.isNeutered
    };

  } catch (error: unknown) {
    console.error('Failed to create pet:', error);
    if (error instanceof ServerActionError) throw error;
    
    if (isPrismaError(error)) {
      if (error.code === 'P2002') {
        throw new ServerActionError('Pet with this name already exists', 409);
      }
      if (error.code === 'P2003') {
        throw new ServerActionError('User not found', 404);
      }
    }
    
    throw new ServerActionError('Failed to create pet');
  }
}