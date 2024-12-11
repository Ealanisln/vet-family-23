// app/actions/inventory-actions.ts
"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import {
  InventoryStatus,
  MovementType,
  InventoryCategory,
} from "@prisma/client";
import { InventoryItemFormData } from "@/components/Inventory/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export async function getInventory() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        movements: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Convertir fechas a strings para serialización
    const serializedItems = items.map((item) => ({
      ...item,
      expirationDate: item.expirationDate?.toISOString() || null,
      movements: item.movements.map((movement) => ({
        ...movement,
        date: movement.date.toISOString(),
      })),
    }));

    return { success: true, items: serializedItems };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { success: false, error: "Failed to fetch inventory" };
  }
}

interface UpdateInventoryData {
  quantity?: number;
  status?: InventoryStatus;
  location?: string;
  minStock?: number;
}

export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryData,
  _userId: string,
  reason?: string
) {
  try {
    // Get user session
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    // Instead of redirecting, return an auth error
    if (!kindeUser || !kindeUser.id) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true  // Add this flag to handle it in the frontend
      };
    }

    // Rest of your code...
    const user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuario no autorizado"
      };
    }

    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      throw new Error("Item not found");
    }

    const [updatedItem] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          ...data,
          status:
            data.quantity !== undefined
              ? data.quantity <= (data.minStock || currentItem.minStock || 0)
                ? InventoryStatus.LOW_STOCK
                : data.quantity === 0
                  ? InventoryStatus.OUT_OF_STOCK
                  : InventoryStatus.ACTIVE
              : data.status,
        },
      }),
      ...(data.quantity !== undefined
        ? [
            prisma.inventoryMovement.create({
              data: {
                itemId: id,
                type:
                  data.quantity > (currentItem.quantity || 0)
                    ? MovementType.IN
                    : MovementType.OUT,
                quantity: Math.abs(data.quantity - (currentItem.quantity || 0)),
                userId: user.id, // Usamos el ID del usuario de nuestra base de datos
                reason: reason || "Manual adjustment",
              },
            }),
          ]
        : []),
    ]);

    revalidatePath("/inventory");
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return { success: false, error: "Failed to update inventory" };
  }
}
export async function createInventoryItem(
  data: InventoryItemFormData,
  reason?: string
) {
  // Obtener información del usuario
  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  if (!kindeUser || !kindeUser.id) {
    redirect("/api/auth/login");
  }

  try {
    // Obtener el usuario de nuestra base de datos
    const user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuario no autorizado",
      };
    }

    // Validaciones
    if (!data.name?.trim()) {
      return { success: false, error: "El nombre es requerido" };
    }

    if (!data.category) {
      return { success: false, error: "La categoría es requerida" };
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
      return { success: false, error: "La cantidad no puede ser negativa" };
    }

    // Crear el item con su movimiento inicial
    const newItem = await prisma.inventoryItem.create({
      data: {
        name: data.name.trim(),
        category: data.category,
        description: data.description?.trim() || null,
        activeCompound: data.activeCompound?.trim() || null,
        presentation: data.presentation?.trim() || null,
        measure: data.measure?.trim() || null,
        brand: data.brand?.trim() || null,
        quantity: data.quantity,
        minStock: data.minStock || 0,
        location: data.location?.trim() || null,
        expirationDate: data.expirationDate
          ? new Date(data.expirationDate)
          : null,
        batchNumber: data.batchNumber?.trim() || null,
        specialNotes: data.specialNotes?.trim() || null,
        status:
          data.quantity <= (data.minStock || 0)
            ? InventoryStatus.LOW_STOCK
            : data.quantity === 0
              ? InventoryStatus.OUT_OF_STOCK
              : InventoryStatus.ACTIVE,
        // Crear el movimiento inicial usando create nested
        movements: {
          create: {
            type: MovementType.IN,
            quantity: data.quantity,
            userId: user.id, // Usamos el ID del usuario de nuestra base de datos
            reason: reason || "Creación inicial del item",
            date: new Date(),
          },
        },
      },
      // Incluir los movements en la respuesta
      include: {
        movements: {
          take: 1,
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/inventory");

    // Serializar las fechas antes de retornar
    return {
      success: true,
      item: {
        ...newItem,
        expirationDate: newItem.expirationDate?.toISOString() || null,
        movements: newItem.movements.map((movement) => ({
          ...movement,
          date: movement.date.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: "Failed to create inventory item" };
  }
}
