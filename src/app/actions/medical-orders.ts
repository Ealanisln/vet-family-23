"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

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
        status: "PENDING",
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

    revalidatePath(`/admin/mascotas/${data.petId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error creating medical order:", error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002':
          return { success: false, error: "Ya existe una orden médica con estos datos" };
        case 'P2003':
          return { success: false, error: "Referencia inválida a mascota o usuario" };
        case 'P2025':
          return { success: false, error: "No se encontró la mascota o el usuario" };
        default:
          return { success: false, error: `Error de base de datos: ${error.code}` };
      }
    }

    return { success: false, error: "Error al crear la orden médica" };
  }
}

export async function getPendingMedicalOrders() {
  try {
    const orders = await prisma.medicalOrder.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        products: {
          include: {
            product: true
          }
        },
        pet: true,
        user: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching pending medical orders:", error);
    return { success: false, error: "Error al obtener las órdenes médicas pendientes" };
  }
}

export async function completeMedicalOrder(orderId: string, saleId: string) {
  try {
    const order = await prisma.medicalOrder.update({
      where: { id: orderId },
      data: {
        status: "COMPLETED",
        saleId: saleId
      }
    });

    revalidatePath("/admin/pos/ventas");
    return { success: true, order };
  } catch (error) {
    console.error("Error completing medical order:", error);
    return { success: false, error: "Error al completar la orden médica" };
  }
}

export async function cancelMedicalOrder(orderId: string) {
  try {
    const order = await prisma.medicalOrder.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED"
      }
    });

    revalidatePath("/admin/pos/ventas");
    return { success: true, order };
  } catch (error) {
    console.error("Error canceling medical order:", error);
    return { success: false, error: "Error al cancelar la orden médica" };
  }
} 