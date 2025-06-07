'use server'

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { IDewormingInput } from "@/types/pet";
// Using string literals instead of importing enums due to type generation issues
export async function addDeworming(petId: string, data: IDewormingInput) {
  try {
    if (!data.dewormingType || !data.stage || !data.administrationDate || !data.nextDoseDate) {
      return { 
        success: false, 
        error: 'Faltan campos requeridos' 
      };
    }

    const deworming = await prisma.deworming.create({
      data: {
        id: crypto.randomUUID(),
        petId,
        dewormingType: data.dewormingType,
        stage: data.stage,
        status: 'SCHEDULED',
        administrationDate: data.administrationDate,
        nextDoseDate: data.nextDoseDate,
        batchNumber: data.batchNumber || null,
        manufacturer: data.manufacturer || null,
        veterinarianName: data.veterinarianName || null,
        notes: data.notes || null,
        updatedAt: new Date()
      }
    });
    
    revalidatePath(`/admin/mascotas/${petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true, deworming };
  } catch (error) {
    console.error('Error al crear la desparasitación:', error);
    return { 
      success: false, 
      error: 'No se pudo crear la desparasitación' 
    };
  }
}

export async function updateDeworming(id: string, data: IDewormingInput) {
  try {
    if (!data.dewormingType || !data.stage || !data.administrationDate || !data.nextDoseDate) {
      return { 
        success: false, 
        error: 'Faltan campos requeridos' 
      };
    }

    const deworming = await prisma.deworming.update({
      where: { id },
      data: {
        dewormingType: data.dewormingType,
        stage: data.stage,
        administrationDate: data.administrationDate,
        nextDoseDate: data.nextDoseDate,
        batchNumber: data.batchNumber || null,
        manufacturer: data.manufacturer || null,
        veterinarianName: data.veterinarianName || null,
        notes: data.notes || null,
      }
    });

    revalidatePath(`/admin/mascotas/${deworming.petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true, deworming };
  } catch (error) {
    console.error('Error al actualizar la desparasitación:', error);
    return { 
      success: false, 
      error: 'No se pudo actualizar la desparasitación' 
    };
  }
}

export async function updateOverdueDewormings() {
  try {
    const today = new Date();
    const overdueDewormings = await prisma.deworming.updateMany({
      where: {
        nextDoseDate: {
          lt: today
        },
        status: {
          not: 'COMPLETED'
        }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    return { success: true, count: overdueDewormings.count };
  } catch (error) {
    console.error('Error al actualizar desparasitaciones vencidas:', error);
    return { 
      success: false, 
      error: 'No se pudieron actualizar las desparasitaciones vencidas' 
    };
  }
}

export async function getUpcomingDewormings(petId: string) {
  try {
    const upcoming = await prisma.deworming.findMany({
      where: {
        petId,
        status: {
          in: ['SCHEDULED', 'PENDING']
        },
        nextDoseDate: {
          gte: new Date()
        }
      },
      orderBy: {
        nextDoseDate: 'asc'
      }
    });

    return { success: true, dewormings: upcoming };
  } catch (error) {
    console.error('Error al obtener próximas desparasitaciones:', error);
    return { 
      success: false, 
      error: 'No se pudieron obtener las próximas desparasitaciones' 
    };
  }
} 