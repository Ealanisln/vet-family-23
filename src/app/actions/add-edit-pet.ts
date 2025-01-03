"use server";

import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

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
  console.log("Starting addPet action with userId:", userId);
  console.log("Pet data received:", JSON.stringify(petData, null, 2));

  if (!userId) {
    console.error("addPet called with invalid userId");
    return {
      success: false,
      error: "Invalid user ID provided",
    };
  }

  // Validate weight before database operation
  if (isNaN(petData.weight)) {
    return {
      success: false,
      error: "Invalid weight value provided",
    };
  }

  try {
    // Verify user exists before attempting to add pet
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.error(`User with ID ${userId} not found`);
      return {
        success: false,
        error: "User not found",
      };
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      console.log("Starting database transaction");

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
          user: {
            connect: {
              id: userId
            }
          }
        },
        include: {
          medicalHistory: true,
        },
      });

      // Create medical history if provided
      if (petData.medicalHistory) {
        console.log("Creating initial medical history");
        await tx.medicalHistory.create({
          data: {
            petId: newPet.id,
            visitDate: new Date(),
            reasonForVisit: "Initial check-up",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
            prescriptions: [],
          },
        });
      }

      console.log("Pet created successfully:", newPet.id);
      return newPet;
    });

    console.log("Transaction completed successfully");
    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result };
  } catch (error) {
    console.error("Failed to add pet. Full error:", error);
    console.error(
      "Error stack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    );

    // Determine if it's a Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      // Handle specific Prisma error codes
      switch (error.code) {
        case "P2002":
          return {
            success: false,
            error: "A pet with this information already exists",
          };
        case "P2003":
          return { success: false, error: "Invalid reference to related data" };
        default:
          return { success: false, error: `Database error: ${error.code}` };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add pet",
    };
  }
}

export async function updatePet(
  userId: string,
  petId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<any>> {
  console.log("Starting updatePet action", { userId, petId });
  console.log("Update data:", JSON.stringify(petData, null, 2));

  if (!userId || !petId) {
    console.error("updatePet called with invalid userId or petId");
    return {
      success: false,
      error: "Invalid user ID or pet ID provided",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // First verify the pet belongs to the user
      const existingPet = await tx.pet.findFirst({
        where: {
          id: petId,
          userId: userId,
        },
      });

      if (!existingPet) {
        console.error(
          `Pet not found or unauthorized. PetId: ${petId}, UserId: ${userId}`
        );
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
          medicalHistory: {
            orderBy: {
              visitDate: "desc",
            },
            take: 1,
          },
        },
      });

      if (petData.medicalHistory) {
        const latestHistory = updatedPet.medicalHistory[0];

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
              petId: updatedPet.id,
              visitDate: new Date(),
              reasonForVisit: "Update information",
              diagnosis: "N/A",
              treatment: "N/A",
              notes: petData.medicalHistory,
              prescriptions: [],
            },
          });
        }
      }

      return updatedPet;
    });

    console.log("Pet updated successfully");
    revalidatePath(`/admin/clientes/${userId}`);
    return { success: true, pet: result };
  } catch (error) {
    console.error("Failed to update pet:", error);
    console.error(
      "Error stack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    );

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error code:", error.code);
      switch (error.code) {
        case "P2025":
          return { success: false, error: "Pet not found" };
        default:
          return { success: false, error: `Database error: ${error.code}` };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update pet",
    };
  }
}

export async function updatePetNeuteredStatus(
  userId: string,
  petId: string,
  isNeutered: boolean
): Promise<ActionResult<any>> {
  console.log("Updating neutered status", { userId, petId, isNeutered });

  try {
    const updatedPet = await prisma.pet.update({
      where: {
        id: petId,
        userId: userId, // Ensure the pet belongs to the user
      },
      data: { isNeutered },
    });

    console.log("Neutered status updated successfully");
    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet neutered status:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
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
  console.log("Updating deceased status", { userId, petId, isDeceased });

  try {
    const updatedPet = await prisma.pet.update({
      where: {
        id: petId,
        userId: userId, // Ensure the pet belongs to the user
      },
      data: { isDeceased },
    });

    console.log("Deceased status updated successfully");
    revalidatePath(`/admin/mascotas/${petId}`);
    return { success: true, pet: updatedPet };
  } catch (error) {
    console.error("Failed to update pet deceased status:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return { success: false, error: "Pet not found or unauthorized" };
    }
    return { success: false, error: "Failed to update pet deceased status" };
  }
}