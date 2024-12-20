"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface PetDataForSubmit {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber?: string;
  medicalHistory?: string;
  isNeutered: boolean;
  isDeceased?: boolean;
  internalId?: string;
}

interface ActionResult<T> {
  success: boolean;
  error?: string;
  pet?: T;
}

export async function addPet(
  userId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<any>> {
  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate a UUID for the pet
      const petId = uuidv4();
      
      const newPet = await tx.pet.create({
        data: {
          id: petId,
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          dateOfBirth: petData.dateOfBirth,
          gender: petData.gender,
          weight: petData.weight,
          microchipNumber: petData.microchipNumber || null,
          isNeutered: petData.isNeutered,
          isDeceased: false,
          internalId: petData.internalId || null,
          userId: userId // Direct assignment in PostgreSQL
        },
        include: {
          medicalHistory: true
        }
      });

      if (petData.medicalHistory) {
        await tx.medicalHistory.create({
          data: {
            petId: newPet.id,
            visitDate: new Date(),
            reasonForVisit: "Initial check-up",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
            prescriptions: [] // Empty array for initial creation
          }
        });
      }

      return newPet;
    });

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result };
  } catch (error) {
    console.error("Failed to add pet:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add pet" 
    };
  }
}

export async function updatePet(
  userId: string,
  petId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<any>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // First verify the pet belongs to the user
      const existingPet = await tx.pet.findFirst({
        where: {
          id: petId,
          userId: userId
        }
      });

      if (!existingPet) {
        throw new Error("Pet not found or unauthorized");
      }

      const updatedPet = await tx.pet.update({
        where: { id: petId },
        data: {
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          dateOfBirth: petData.dateOfBirth,
          gender: petData.gender,
          weight: petData.weight,
          microchipNumber: petData.microchipNumber || null,
          isNeutered: petData.isNeutered ?? existingPet.isNeutered,
          isDeceased: petData.isDeceased ?? existingPet.isDeceased,
          internalId: petData.internalId || null
        },
        include: {
          medicalHistory: {
            orderBy: {
              visitDate: 'desc'
            },
            take: 1
          }
        }
      });

      if (petData.medicalHistory) {
        const latestHistory = updatedPet.medicalHistory[0];
        
        if (latestHistory) {
          await tx.medicalHistory.update({
            where: { id: latestHistory.id },
            data: {
              notes: petData.medicalHistory
            }
          });
        } else {
          await tx.medicalHistory.create({
            data: {
              petId: updatedPet.id,
              visitDate: new Date(),
              reasonForVisit: "Update information",
              diagnosis: "N/A",
              treatment: "N/A",
              notes: petData.medicalHistory,
              prescriptions: []
            }
          });
        }
      }

      return updatedPet;
    });

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result };
  } catch (error) {
    console.error("Failed to update pet:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update pet" 
    };
  }
}

export async function updatePetNeuteredStatus(
  userId: string,
  petId: string,
  isNeutered: boolean
): Promise<ActionResult<any>> {
  try {
    const updatedPet = await prisma.pet.update({
      where: { 
        id: petId,
        userId: userId // Ensure the pet belongs to the user
      },
      data: { isNeutered }
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet neutered status:", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return { success: false, error: "Pet not found or unauthorized" };
    }
    return { success: false, error: "Failed to update pet neutered status" };
  }
}

export async function updatePetDeceasedStatus(
  userId: string,
  petId: string,
  isDeceased: boolean
): Promise<ActionResult<any>> {
  try {
    const updatedPet = await prisma.pet.update({
      where: { 
        id: petId,
        userId: userId // Ensure the pet belongs to the user
      },
      data: { isDeceased }
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet deceased status:", error);
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return { success: false, error: "Pet not found or unauthorized" };
    }
    return { success: false, error: "Failed to update pet deceased status" };
  }
}