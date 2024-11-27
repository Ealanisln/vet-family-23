// File: app/(admin)/admin/clientes/[id]/mascota/[petId]/getPetDetails.ts
import { prisma } from '@/lib/prismaDB'

export async function getPetDetails(userId: string, petId: string) {
  if (!userId || !petId) {
    throw new Error('Invalid userId or petId')
  }

  try {
    const pet = await prisma.pet.findFirst({
      where: {
        AND: [{ id: petId }, { userId: userId }]
      },
      include: {
        medicalHistory: true,
        vaccinations: true,
        dewormings: true
      }
    });
    

    if (!pet) {
      return null
    }

    return pet
  } catch (error) {
    console.error('Error fetching pet details:', error)
    throw error
  }
}