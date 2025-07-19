"use server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prismaDB";
import { handlePrismaError } from "@/lib/error-handling";

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

type MedicalHistory = {
  id: string;
  petId: string;
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string | null;
};

type Pet = {
  id: string;
  internalId: string | null;
  userId: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  isNeutered: boolean;
  isDeceased: boolean;
  medicalHistory?: MedicalHistory[];
};

type PetWithMedicalHistory = Pet & {
  MedicalHistory: MedicalHistory[];
};



export async function addPet(
  userId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<PetWithMedicalHistory>> {
  if (!userId) {
    return {
      success: false,
      error: "Invalid user ID provided",
    };
  }

  if (isNaN(petData.weight)) {
    return {
      success: false,
      error: "Invalid weight value provided",
    };
  }

  try {
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
          User: {
            connect: {
              id: userId
            }
          }
        },
        include: {
          MedicalHistory: true,
        },
      });

      if (petData.medicalHistory) {
        await tx.medicalHistory.create({
          data: {
            id: uuidv4(),
            petId: newPet.id,
            visitDate: new Date(),
            reasonForVisit: "Initial check-up",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
            prescriptions: [] as string[],
          },
        });
      }

      return newPet;
    });

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result as PetWithMedicalHistory };
  } catch (error: unknown) {
    return handlePrismaError(error, "addPet");
  }
}

export async function updatePet(
  userId: string,
  petId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<PetWithMedicalHistory>> {
  if (!userId || !petId) {
    return {
      success: false,
      error: "Invalid user ID or pet ID provided",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingPet = await tx.pet.findFirst({
        where: {
          id: petId,
          userId: userId,
        },
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
          internalId: petData.internalId || null,
        },
        include: {
          MedicalHistory: {
            orderBy: {
              visitDate: "desc",
            },
            take: 1,
          },
        },
      });

      if (petData.medicalHistory) {
        const latestHistory = updatedPet.MedicalHistory[0];

        if (latestHistory) {
          await tx.medicalHistory.update({
            where: { id: latestHistory.id },
            data: {
              notes: petData.medicalHistory,
            },
          });
        } else {
          await tx.medicalHistory.create({
            data: {
              id: uuidv4(),
              petId: updatedPet.id,
              visitDate: new Date(),
              reasonForVisit: "Update information",
              diagnosis: "N/A",
              treatment: "N/A",
              notes: petData.medicalHistory,
              prescriptions: [] as string[],
            },
          });
        }
      }

      return updatedPet;
    });

    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result as PetWithMedicalHistory };
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return { success: false, error: "Pet not found" };
        default:
          return { success: false, error: `Database error: ${error.code}` };
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to update pet";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updatePetNeuteredStatus(
  userId: string,
  petId: string,
  isNeutered: boolean
): Promise<ActionResult<Pet>> {
  try {
    const updatedPet = await prisma.pet.update({
      where: {
        id: petId,
        userId: userId,
      },
      data: { isNeutered },
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet as Pet };
  } catch (error: unknown) {
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
): Promise<ActionResult<Pet>> {
  try {
    const updatedPet = await prisma.pet.update({
      where: {
        id: petId,
        userId: userId,
      },
      data: { isDeceased },
    });

    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet as Pet };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return { success: false, error: "Pet not found or unauthorized" };
    }
    return { success: false, error: "Failed to update pet deceased status" };
  }
}