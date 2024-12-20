"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import {
  InventoryStatus,
  MovementType,
  InventoryCategory,
} from "@prisma/client";
import {
  UpdateInventoryData,
  InventoryItemFormData,
} from "@/components/Inventory/types";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { randomUUID } from "crypto";

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

export async function updateInventoryItem(
  id: string,
  data: UpdateInventoryData,
  reason?: string
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return {
        success: false,
        error: "No authenticated user",
        requiresAuth: true,
      };
    }

    // Buscar o crear usuario en la base de datos
    let dbUser = await prisma.user.findUnique({
      where: { kindeId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          kindeId: user.id,
          email: user.email || "",
          name: user.given_name || user.family_name || "Usuario",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Verificar item
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return { success: false, error: "Item not found" };
    }

    // Realizar actualización
    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.update({
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
      });

      if (
        data.quantity !== undefined &&
        data.quantity !== currentItem.quantity
      ) {
        await tx.inventoryMovement.create({
          data: {
            itemId: id,
            type:
              data.quantity > currentItem.quantity
                ? MovementType.IN
                : MovementType.OUT,
            quantity: Math.abs(data.quantity - currentItem.quantity),
            userId: dbUser.id,
            reason: reason || "Manual adjustment",
            date: new Date(),
          },
        });
      }

      return item;
    });

    return { success: true, item: updatedItem };
  } catch (error) {
    console.error("Operation failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update inventory",
    };
  }
}

export async function createInventoryItem(
  data: InventoryItemFormData,
  reason?: string
) {
  try {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    const user = await prisma.user.findUnique({
      where: { kindeId: kindeUser.id },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuario no autorizado",
      };
    }

    if (!data.name?.trim()) {
      return { success: false, error: "El nombre es requerido" };
    }

    if (!data.category) {
      return { success: false, error: "La categoría es requerida" };
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
      return { success: false, error: "La cantidad no puede ser negativa" };
    }

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
        movements: {
          create: {
            type: MovementType.IN,
            quantity: data.quantity,
            userId: user.id,
            reason: reason || "Creación inicial del item",
            date: new Date(),
          },
        },
      },
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

    try {
      await revalidatePath("/admin/inventario");
    } catch (revalidateError) {
      console.error("Error during revalidation:", revalidateError);
      // Continuamos a pesar del error de revalidación
    }

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
      redirectTo: "/admin/inventario",
    };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create inventory item",
    };
  }
}
