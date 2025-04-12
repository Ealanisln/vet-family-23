"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";

// The status field and related logic will be removed
interface CreateMedicalOrderInput {
  petId: string;
  userId: string;
  visitDate: Date;
  diagnosis?: string;
  treatment?: string;
  prescriptions: string[];
  notes?: string;
  products: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

export async function createMedicalOrder(data: CreateMedicalOrderInput) {
  try {
    // First verify that the pet and user exist
    const [pet, user] = await Promise.all([
      prisma.pet.findUnique({ where: { id: data.petId } }),
      prisma.user.findUnique({ where: { id: data.userId } })
    ]);

    if (!pet) {
      console.error("Pet not found:", data.petId);
      return { success: false, error: "Mascota no encontrada" };
    }

    if (!user) {
      console.error("User not found:", data.userId);
      return { success: false, error: "Usuario no encontrado" };
    }

    // Create the medical order
    const order = await prisma.medicalOrder.create({
      data: {
        petId: data.petId,
        userId: data.userId,
        visitDate: data.visitDate,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescriptions: data.prescriptions,
        notes: data.notes,
        products: {
          create: data.products.map(product => ({
            productId: product.productId,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            notes: product.notes
          }))
        }
      },
      include: {
        products: true,
        pet: true,
        user: true
      }
    });

    // Adjust revalidatePath if necessary (e.g., if status affected other views)
    revalidatePath(`/admin/mascotas/${data.petId}`);
    // Adjusted return value - return the full order object
    return { success: true, order };
  } catch (error) {
    console.error("Error al crear la orden médica:", error);
    return { success: false, error: "Error al crear la orden médica" };
  }
}

// REMOVE: export async function getPendingMedicalOrders() { ... }

// REMOVE: export async function completeMedicalOrder(orderId: string, saleId: string) { ... }

// REMOVE: export async function cancelMedicalOrder(orderId: string) { ... } 