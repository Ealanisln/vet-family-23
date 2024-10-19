"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function addPet(
  userId: string,
  petData: {
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    gender: string;
    weight: number;
    microchipNumber?: string;
    medicalHistory?: string;
    isNeutered?: boolean;
    isDeceased?: boolean;
    internalId?: string;  
  }
) {
  try {
    const newPet = await prisma.pet.create({
      data: {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        dateOfBirth: petData.dateOfBirth,
        gender: petData.gender,
        weight: petData.weight,
        microchipNumber: petData.microchipNumber,
        isNeutered: petData.isNeutered || false,
        isDeceased: petData.isDeceased || false,
        internalId: petData.internalId, 
        user: {
          connect: { id: userId }
        }
      },
    });

    if (petData.medicalHistory) {
      await prisma.medicalHistory.create({
        data: {
          petId: newPet.id,
          visitDate: new Date(),
          reasonForVisit: "Initial check-up",
          diagnosis: "N/A",
          treatment: "N/A",
          notes: petData.medicalHistory,
        },
      });
    }

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: newPet };
  } catch (error) {
    console.error("Failed to add pet:", error);
    return { success: false, error: "Failed to add pet" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePet(
  userId: string,
  petId: string,
  petData: {
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    gender: string;
    weight: number;
    microchipNumber?: string;
    medicalHistory?: string;
    isNeutered?: boolean;
    isDeceased?: boolean;
    internalId?: string;  
  }
) {
  try {
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        dateOfBirth: petData.dateOfBirth,
        gender: petData.gender,
        weight: petData.weight,
        microchipNumber: petData.microchipNumber,
        isNeutered: petData.isNeutered,
        isDeceased: petData.isDeceased,
        internalId: petData.internalId,  
      },
    });

    if (petData.medicalHistory) {
      // Check if there's an existing medical history entry
      const existingHistory = await prisma.medicalHistory.findFirst({
        where: { petId: petId },
        orderBy: { visitDate: "desc" },
      });

      if (existingHistory) {
        // Update the existing medical history
        await prisma.medicalHistory.update({
          where: { id: existingHistory.id },
          data: {
            notes: petData.medicalHistory,
            // You might want to update other fields here as well
          },
        });
      } else {
        // Create a new medical history entry
        await prisma.medicalHistory.create({
          data: {
            petId: updatedPet.id,
            visitDate: new Date(),
            reasonForVisit: "Update information",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
          },
        });
      }
    }

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet:", error);
    return { success: false, error: "Failed to update pet" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePetNeuteredStatus(
  petId: string,
  isNeutered: boolean
) {
  try {
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: { isNeutered },
    });

    revalidatePath(`/admin/mascotas/${petId}`);

    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet neutered status:", error);
    return { success: false, error: "Failed to update pet neutered status" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function updatePetDeceasedStatus(
  petId: string,
  isDeceased: boolean
) {
  try {
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: { isDeceased },
    });

    revalidatePath(`/admin/mascotas/${petId}`);

    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet deceased status:", error);
    return { success: false, error: "Failed to update pet deceased status" };
  } finally {
    await prisma.$disconnect();
  }
}
