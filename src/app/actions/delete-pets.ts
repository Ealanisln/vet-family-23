"use server";

import { PrismaClient, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prismaDB";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function deletePet(
  userId: string,
  petId: string
): Promise<ActionResult> {
  console.log('Starting deletePet action', { userId, petId });

  if (!userId || !petId) {
    console.error('deletePet called with invalid userId or petId');
    return {
      success: false,
      error: "ID de usuario o mascota inválido"
    };
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // First verify the pet belongs to the user
      const existingPet = await tx.pet.findFirst({
        where: {
          id: petId,
          userId: userId
        }
      });

      if (!existingPet) {
        console.error(`Pet not found or unauthorized. PetId: ${petId}, UserId: ${userId}`);
        throw new Error("Mascota no encontrada o no autorizado");
      }

      // Delete the pet - this will cascade to all related records
      await tx.pet.delete({
        where: {
          id: petId
        }
      });

      return true;
    });

    console.log('Pet deleted successfully');
    
    // Revalidate both the client list and specific client pages
    revalidatePath('/admin/clientes');
    revalidatePath(`/admin/clientes/${userId}`);
    
    return { 
      success: true 
    };
  } catch (error: unknown) {
    console.error("Failed to delete pet:", error);
    console.error("Error stack trace:", error instanceof Error ? error.stack : "No stack trace available");
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string };
      switch (prismaError.code) {
        case 'P2025':
          return { 
            success: false, 
            error: "No se encontró la mascota" 
          };
        case 'P2003':
          return { 
            success: false, 
            error: "No se puede eliminar la mascota debido a registros relacionados" 
          };
        default:
          return { 
            success: false, 
            error: `Error de base de datos: ${prismaError.code}` 
          };
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar la mascota" 
    };
  }
}