'use server'

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { IVaccinationInput } from "@/components/Vaccination/VaccinationDialogCard";

export async function addVaccination(petId: string, data: IVaccinationInput) {
  try {
    if (!data.vaccineType || !data.stage || !data.administrationDate || !data.nextDoseDate) {
      return { 
        success: false, 
        error: 'Faltan campos requeridos' 
      };
    }

    const vaccination = await prisma.vaccination.create({
      data: {
        petId,
        vaccineType: data.vaccineType,
        stage: data.stage,
        administrationDate: data.administrationDate,
        nextDoseDate: data.nextDoseDate,
        status: 'SCHEDULED',
        batchNumber: data.batchNumber || null,
        manufacturer: data.manufacturer || null,
        veterinarianName: data.veterinarianName || null,
        notes: data.notes || null,
      }
    });
    
    revalidatePath(`/admin/mascotas/${petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true, vaccination };
  } catch (error) {
    console.error('Error al crear la vacunación:', error);
    return { 
      success: false, 
      error: 'No se pudo crear la vacunación' 
    };
  }
}

export async function updateVaccination(id: string, data: IVaccinationInput) {
  try {
    if (!data.vaccineType || !data.stage || !data.administrationDate || !data.nextDoseDate) {
      return { 
        success: false, 
        error: 'Faltan campos requeridos' 
      };
    }

    const vaccination = await prisma.vaccination.update({
      where: { id },
      data: {
        vaccineType: data.vaccineType,
        stage: data.stage,
        administrationDate: data.administrationDate,
        nextDoseDate: data.nextDoseDate,
        batchNumber: data.batchNumber || null,
        manufacturer: data.manufacturer || null,
        veterinarianName: data.veterinarianName || null,
        notes: data.notes || null,
      }
    });

    // Obtener el petId para revalidar la ruta correcta
    revalidatePath(`/admin/mascotas/${vaccination.petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true, vaccination };
  } catch (error) {
    console.error('Error al actualizar la vacunación:', error);
    return { 
      success: false, 
      error: 'No se pudo actualizar la vacunación' 
    };
  }
}

export async function deleteVaccination(id: string) {
  try {
    const vaccination = await prisma.vaccination.delete({
      where: { id }
    });
    
    revalidatePath(`/admin/mascotas/${vaccination.petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar la vacunación:', error);
    return { 
      success: false, 
      error: 'No se pudo eliminar la vacunación' 
    };
  }
}

// Función auxiliar para actualizar el estado de las vacunas vencidas
export async function updateOverdueVaccinations() {
  try {
    const today = new Date();
    const overdueVaccinations = await prisma.vaccination.updateMany({
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

    return { success: true, count: overdueVaccinations.count };
  } catch (error) {
    console.error('Error al actualizar vacunas vencidas:', error);
    return { 
      success: false, 
      error: 'No se pudieron actualizar las vacunas vencidas' 
    };
  }
}

// Función para cambiar el estado de una vacuna a completada
export async function markVaccinationAsCompleted(id: string) {
  try {
    const vaccination = await prisma.vaccination.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      }
    });

    revalidatePath(`/admin/mascotas/${vaccination.petId}`);
    revalidatePath('/admin/mascotas');
    
    return { success: true, vaccination };
  } catch (error) {
    console.error('Error al marcar la vacuna como completada:', error);
    return { 
      success: false, 
      error: 'No se pudo completar la vacuna' 
    };
  }
}

// Función para obtener el próximo calendario de vacunación
export async function getUpcomingVaccinations(petId: string) {
  try {
    const upcoming = await prisma.vaccination.findMany({
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

    return { success: true, vaccinations: upcoming };
  } catch (error) {
    console.error('Error al obtener próximas vacunas:', error);
    return { 
      success: false, 
      error: 'No se pudieron obtener las próximas vacunas' 
    };
  }
}