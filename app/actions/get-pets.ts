'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getPets() {
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

    // Format the data to match the Pet type in the PetsTable component
    const formattedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      userId: pet.userId,
      ownerName: `${pet.user.firstName || ''} ${pet.user.lastName || ''}`.trim() || 'N/A'
    }))

    return formattedPets
  } catch (error) {
    console.error('Failed to fetch pets:', error)
    throw new Error('Failed to fetch pets')
  } finally {
    await prisma.$disconnect()
  }
}