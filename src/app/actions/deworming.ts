'use server'

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const dewormingSchema = z.object({
  applicationDate: z.string().min(1),
  nextApplication: z.string().min(1),
  weight: z.string().min(1),
  dose: z.string().min(1),
  lotNumber: z.string().optional(),
  veterinarianName: z.string().optional(),
  effectiveness: z.string().optional(),
  sideEffects: z.string().optional(),
  notes: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().optional(),
});

type DewormingInput = z.infer<typeof dewormingSchema>;

export async function addDeworming(
  petId: string, 
  type: 'INTERNAL' | 'EXTERNAL',
  data: DewormingInput
) {
  try {
    if (!data.applicationDate || !data.nextApplication || !data.weight || !data.dose) {
      return {
        success: false,
        error: 'Faltan campos requeridos'
      };
    }

    // Crear el registro de desparasitación primero
    const deworming = await prisma.deworming.create({
      data: {
        petId,
        type,
        applicationDate: new Date(data.applicationDate),
        nextApplication: new Date(data.nextApplication),
        weight: parseFloat(data.weight),
        dose: data.dose,
        lotNumber: data.lotNumber || null,
        veterinarianName: data.veterinarianName || null,
        effectiveness: data.effectiveness || null,
        sideEffects: data.sideEffects || null,
        notes: data.notes || null,
        status: 'COMPLETED',
        productId: data.productId || null,
      }
    });

    // Si hay producto, intentar actualizar el inventario después
    if (data.productId && data.quantity) {
      try {
        const product = await prisma.inventoryItem.findUnique({
          where: { id: data.productId }
        });

        if (!product) {
          throw new Error('Producto no encontrado');
        }

        if (product.quantity < data.quantity) {
          throw new Error('Stock insuficiente');
        }

        // Actualizar inventario
        const newQuantity = product.quantity - data.quantity;
        await prisma.$runCommandRaw({
          update: "inventory_items",
          updates: [
            {
              q: { _id: { $oid: data.productId } },
              u: { $set: { quantity: newQuantity } }
            }
          ]
        });

        // Crear movimiento de inventario
        await prisma.inventoryMovement.create({
          data: {
            itemId: data.productId,
            type: 'OUT',
            quantity: data.quantity,
            reason: `Desparasitación ${type.toLowerCase()} - Mascota ID: ${petId}`,
            userId: 'SYSTEM',
            relatedRecordId: deworming.id,
          }
        });
      } catch (inventoryError) {
        console.error('Error al actualizar inventario:', inventoryError);
        // No revertimos nada ya que el registro principal ya está creado
      }
    }

    revalidatePath(`/admin/mascotas/${petId}`);
    revalidatePath('/admin/mascotas');
    revalidatePath('/admin/inventario');

    return { success: true, deworming };
  } catch (error: any) {
    console.error('Error al crear el registro de desparasitación:', error);
    return {
      success: false,
      error: error?.message || 'No se pudo crear el registro de desparasitación'
    };
  }
}

export async function getAvailableProducts(type: 'INTERNAL' | 'EXTERNAL') {
  try {
    const products = await prisma.inventoryItem.findMany({
      where: {
        category: 'MEDICINE',
        status: 'ACTIVE',
        quantity: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        presentation: true,
        measure: true,
        brand: true,
      }
    });

    return { success: true, products };
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return {
      success: false,
      error: error?.message || 'No se pudieron obtener los productos'
    };
  }
}

export async function updateDeworming(
  id: string,
  data: DewormingInput
) {
  try {
    if (!data.applicationDate || !data.nextApplication || !data.weight || !data.dose) {
      return {
        success: false,
        error: 'Faltan campos requeridos'
      };
    }

    // Actualizar solo el registro de desparasitación
    const deworming = await prisma.deworming.update({
      where: { id },
      data: {
        applicationDate: new Date(data.applicationDate),
        nextApplication: new Date(data.nextApplication),
        weight: parseFloat(data.weight),
        dose: data.dose,
        lotNumber: data.lotNumber || null,
        veterinarianName: data.veterinarianName || null,
        effectiveness: data.effectiveness || null,
        sideEffects: data.sideEffects || null,
        notes: data.notes || null,
        productId: data.productId || null,
      }
    });

    // No actualizamos el inventario en la actualización para evitar complejidad
    // Si necesitas cambiar el producto, se recomienda crear un nuevo registro

    revalidatePath(`/admin/mascotas/${deworming.petId}`);
    revalidatePath('/admin/mascotas');
    revalidatePath('/admin/inventario');

    return { success: true, deworming };
  } catch (error: any) {
    console.error('Error al actualizar el registro de desparasitación:', error);
    return {
      success: false,
      error: error?.message || 'No se pudo actualizar el registro de desparasitación'
    };
  }
}