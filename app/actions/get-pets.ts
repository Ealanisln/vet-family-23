'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  userId: string;
  ownerName: string;
}

type GetPetsResult = 
  | { success: true; pets: Pet[] }
  | { success: false; error: string; pets: never[] }

export async function getPets(): Promise<GetPetsResult> {
  try {
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        userId: true,
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
    })

    const formattedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      userId: pet.userId,
      ownerName: `${pet.user.firstName || ''} ${pet.user.lastName || ''}`.trim() || 'N/A'
    }))

    return { success: true, pets: formattedPets }
  } catch (error) {
    console.error('Failed to fetch pets:', error)
    return { success: false, error: 'Failed to fetch pets', pets: [] }
  } finally {
    await prisma.$disconnect()
  }
}