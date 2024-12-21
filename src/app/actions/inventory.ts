"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { InventoryStatus, MovementType } from "@prisma/client";
import {
  GetInventoryResponse,
  UpdateInventoryData,
  UpdateInventoryResponse,
  InventoryItemFormData,
  CreateInventoryResponse,
} from "@/types/inventory";

export async function getInventory(): Promise<GetInventoryResponse> {
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
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
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
): Promise<UpdateInventoryResponse> {
  try {
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return { success: false, error: "Item not found" };
    }

    // Convertir la fecha de expiración a DateTime ISO si existe
    const formattedData = {
      ...data,
      expirationDate: data.expirationDate 
        ? new Date(data.expirationDate).toISOString()
        : null,
    };

    const updatedItem = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.update({
        where: { id },
        data: {
          ...formattedData,
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
            reason: reason || "Manual adjustment",
          },
        });
      }

      return item;
    });
    return {
      success: true,
      item: {
        ...updatedItem,
        expirationDate: updatedItem.expirationDate?.toISOString() || null,
        createdAt: updatedItem.createdAt.toISOString(),
        updatedAt: updatedItem.updatedAt.toISOString(),
        movements: [],
      },
    };
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
): Promise<CreateInventoryResponse> {
  try {
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
      },
    });

    try {
      await revalidatePath("/admin/inventario");
    } catch (revalidateError) {
      console.error("Error during revalidation:", revalidateError);
    }

    return {
      success: true,
      item: {
        ...newItem,
        expirationDate: newItem.expirationDate?.toISOString() || null,
        createdAt: newItem.createdAt.toISOString(),
        updatedAt: newItem.updatedAt.toISOString(),
        movements: [],
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
