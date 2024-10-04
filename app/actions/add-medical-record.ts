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
      ownerName: `${pet.user?.firstName || ''} ${pet.user?.lastName || ''}`.trim() || 'N/A'
    }))

    return { success: true, pets: formattedPets }
  } catch (error) {
    console.error('Failed to fetch pets for medical record:', error)
    return { success: false, error: 'Failed to fetch pets for medical record' }
  }
}

interface MedicalHistoryInput {
  id?: string;  // Make id optional
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

type MedicalHistoryResult = 
  | { success: true; record: any }
  | { success: false; error: string }

export async function addMedicalHistory(petId: string, recordData: MedicalHistoryInput): Promise<MedicalHistoryResult> {
  try {
    const { id, ...data } = recordData;  // Remove id from data if present
    const newRecord = await prisma.medicalHistory.create({
      data: {
        petId,
        ...data,
        prescriptions: { set: data.prescriptions }
      }
    })

    return { success: true, record: newRecord }
  } catch (error) {
    console.error('Failed to add medical history:', error)
    return { success: false, error: 'Failed to add medical history' }
  }
}

export async function updateMedicalHistory(petId: string, recordData: MedicalHistoryInput): Promise<MedicalHistoryResult> {
  try {
    if (!recordData.id) {
      throw new Error('Record ID is required for updating');
    }

    const { id, ...data } = recordData;
    const updatedRecord = await prisma.medicalHistory.update({
      where: { id: id },
      data: {
        petId,
        ...data,
        prescriptions: { set: data.prescriptions }
      }
    })

    return { success: true, record: updatedRecord }
  } catch (error) {
    console.error('Failed to update medical history:', error)
    return { success: false, error: 'Failed to update medical history' }
  }
}