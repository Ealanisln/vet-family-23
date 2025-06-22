"use server";

import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export interface PetForMedicalRecord {
  id: string;
  name: string;
  species: string;
  ownerName: string;
  isDeceased: boolean;
  isArchived: boolean;
  userId: string;
}

// Define the type for the pet query result
type PetWithUser = {
  id: string;
  name: string;
  species: string;
  isDeceased: boolean;
  isArchived: boolean;
  userId: string;
  user: {
    firstName: string | null;
    lastName: string | null;
  } | null;
};

// Define MedicalHistory type
type MedicalHistory = {
  id: string;
  petId: string;
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes: string | null;
};

type GetPetsForMedicalRecordResult =
  | { success: true; pets: PetForMedicalRecord[] }
  | { success: false; error: string };

export async function getPetsForMedicalRecord(): Promise<GetPetsForMedicalRecordResult> {
  try {
    // Using a more optimized query with PostgreSQL
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        species: true,
        isDeceased: true,
        isArchived: true,
        userId: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      where: {
        // Por defecto no mostrar mascotas archivadas en el historial médico
        isArchived: false,
      },
      orderBy: [
        { isDeceased: 'asc' }, // Show active pets first
        { name: 'asc' }
      ],
    });

    const formattedPets: PetForMedicalRecord[] = pets.map((pet: PetWithUser) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      ownerName: [pet.user?.firstName, pet.user?.lastName]
        .filter(Boolean)
        .join(' ') || 'N/A',
      isDeceased: pet.isDeceased,
      isArchived: pet.isArchived,
      userId: pet.userId,
    }));

    return { success: true, pets: formattedPets };
  } catch (error) {
    console.error("Failed to fetch pets for medical record:", error);
    if (error && typeof error === 'object' && 'code' in error) {
      // Handle specific PostgreSQL errors
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2002':
          return { success: false, error: "Duplicate record found" };
        case 'P2025':
          return { success: false, error: "Record not found" };
        default:
          return { success: false, error: `Database error: ${prismaError.code}` };
      }
    }
    return { success: false, error: "Failed to fetch pets for medical record" };
  }
}

interface MedicalHistoryInput {
  id?: string;
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

type MedicalHistoryResult =
  | { success: true; record: MedicalHistory }
  | { success: false; error: string };

export async function addMedicalHistory(
  petId: string,
  recordData: MedicalHistoryInput
): Promise<MedicalHistoryResult> {
  try {
    // First verify that the pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { id: true, isDeceased: true }
    });

    if (!pet) {
      return { success: false, error: "Pet not found" };
    }

    if (pet.isDeceased) {
      return { success: false, error: "Cannot add medical history for deceased pets" };
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const data = recordData;
      
      const newRecord = await tx.medicalHistory.create({
        data: {
          petId,
          visitDate: data.visitDate,
          reasonForVisit: data.reasonForVisit,
          diagnosis: data.diagnosis,
          treatment: data.treatment,
          prescriptions: data.prescriptions,
          notes: data.notes || null,
        },
      });

      // Update the pet's last visit date if needed
      await tx.pet.update({
        where: { id: petId },
        data: {
          // Add any additional updates needed
        },
      });

      return newRecord;
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, record: result };
  } catch (error) {
    console.error("Failed to add medical history:", error);
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2003':
          return { success: false, error: "Referenced pet does not exist" };
        default:
          return { success: false, error: `Database error: ${prismaError.code}` };
      }
    }
    return { success: false, error: "Failed to add medical history" };
  }
}

export async function updateMedicalHistory(
  petId: string,
  recordData: MedicalHistoryInput
): Promise<MedicalHistoryResult> {
  try {
    if (!recordData.id) {
      return { success: false, error: "Record ID is required for updating" };
    }

    // Verify that the record exists and belongs to the specified pet
    const existingRecord = await prisma.medicalHistory.findFirst({
      where: {
        id: recordData.id,
        petId: petId,
      },
    });

    if (!existingRecord) {
      return { success: false, error: "Medical history record not found or unauthorized" };
    }

    const { id, ...data } = recordData;
    
    const updatedRecord = await prisma.medicalHistory.update({
      where: { 
        id: id,
        petId: petId, // Additional safety check
      },
      data: {
        visitDate: data.visitDate,
        reasonForVisit: data.reasonForVisit,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescriptions: data.prescriptions,
        notes: data.notes || null,
      },
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, record: updatedRecord };
  } catch (error) {
    console.error("Failed to update medical history:", error);
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2025':
          return { success: false, error: "Record not found" };
        case 'P2003':
          return { success: false, error: "Referenced pet does not exist" };
        default:
          return { success: false, error: `Database error: ${prismaError.code}` };
      }
    }
    return { success: false, error: "Failed to update medical history" };
  }
}

// Helper function to get a single medical history record
export async function getMedicalHistoryRecord(
  petId: string,
  recordId: string
): Promise<MedicalHistoryResult> {
  try {
    const record = await prisma.medicalHistory.findFirst({
      where: {
        id: recordId,
        petId: petId,
      },
    });

    if (!record) {
      return { success: false, error: "Medical history record not found" };
    }

    return { success: true, record };
  } catch (error) {
    console.error("Failed to fetch medical history record:", error);
    return { success: false, error: "Failed to fetch medical history record" };
  }
}