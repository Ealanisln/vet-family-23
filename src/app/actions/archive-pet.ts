'use server'

import { PrismaClient } from '@prisma/client'

// Implement singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export interface ArchivePetResult {
  success: boolean;
  error?: string;
}

/**
 * Archiva o desarchivar una mascota
 * @param userId - ID del propietario de la mascota
 * @param petId - ID de la mascota
 * @param isArchived - true para archivar, false para desarchivar
 * @returns Promise<ArchivePetResult>
 */
export async function archivePet(
  userId: string, 
  petId: string, 
  isArchived: boolean
): Promise<ArchivePetResult> {
  console.log(`Server Action: archivePet called for petId: ${petId}, userId: ${userId}, isArchived: ${isArchived}`);

  if (!userId || !petId) {
    return {
      success: false,
      error: 'Los parámetros userId y petId son requeridos.'
    };
  }

  try {
    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: userId
      }
    });

    if (!pet) {
      return {
        success: false,
        error: 'Mascota no encontrada o no tienes permisos para modificarla.'
      };
    }

    // Actualizar el estado de archivado
    await prisma.pet.update({
      where: {
        id: petId
      },
      data: {
        isArchived: isArchived
      }
    });

    console.log(`Pet ${petId} archived status updated to: ${isArchived}`);
    
    return {
      success: true
    };

  } catch (error: unknown) {
    console.error(`Server Action Error in archivePet for petId ${petId}:`, error);
    
    return {
      success: false,
      error: `Error al ${isArchived ? 'archivar' : 'desarchivar'} la mascota.`
    };
  }
} 