'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PetForMedicalRecord {
  id: string;
  name: string;
  species: string;
  ownerName: string;
}

type GetPetsForMedicalRecordResult = 
  | { success: true; pets: PetForMedicalRecord[] }
  | { success: false; error: string }

export async function getPetsForMedicalRecord(): Promise<GetPetsForMedicalRecordResult> {
  try {
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        species: true,
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
      ownerName: `${pet.user.firstName || ''} ${pet.user.lastName || ''}`.trim() || 'N/A'
    }))

    return { success: true, pets: formattedPets }
  } catch (error) {
    console.error('Failed to fetch pets for medical record:', error)
    return { success: false, error: 'Failed to fetch pets for medical record' }
  } finally {
    await prisma.$disconnect()
  }
}

interface MedicalHistoryInput {
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

type AddMedicalHistoryResult = 
  | { success: true; record: any }
  | { success: false; error: string }

export async function addMedicalHistory(petId: string, recordData: MedicalHistoryInput): Promise<AddMedicalHistoryResult> {
  try {
    const newRecord = await prisma.medicalHistory.create({
      data: {
        petId,
        ...recordData
      }
    })

    return { success: true, record: newRecord }
  } catch (error) {
    console.error('Failed to add medical history:', error)
    return { success: false, error: 'Failed to add medical history' }
  } finally {
    await prisma.$disconnect()
  }
}