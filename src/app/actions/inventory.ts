// src/app/actions/inventory.ts

"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// Using string literals instead of importing enums due to type generation issues
type InventoryCategory = 'MEDICINE' | 'SURGICAL_MATERIAL' | 'VACCINE' | 'FOOD' | 'ACCESSORY' | 'CONSUMABLE' | 'ANTI_INFLAMMATORY_ANALGESICS' | 'ANTIBIOTIC' | 'ANTIFUNGAL' | 'DEWORMERS' | 'GASTROPROTECTORS_GASTROENTEROLOGY' | 'CARDIOLOGY' | 'DERMATOLOGY' | 'ENDOCRINOLOGY_HORMONAL' | 'ANESTHETICS_SEDATIVES' | 'OTIC' | 'OINTMENTS' | 'RESPIRATORY' | 'OPHTHALMIC' | 'DRY_FOOD' | 'WET_FOOD' | 'CHIPS' | 'ANTI_EMETIC' | 'ANTISEPTICS_HEALING' | 'NEPHROLOGY' | 'ANTAGONISTS' | 'IMMUNOSTIMULANT' | 'APPETITE_STIMULANTS_HEMATOPOIESIS' | 'SUPPLEMENTS_OTHERS' | 'LAXATIVES' | 'ANTIDIARRHEAL' | 'ANTIHISTAMINE' | 'MEDICATED_SHAMPOO' | 'CORTICOSTEROIDS' | 'EXPECTORANT' | 'BRONCHODILATOR';
type InventoryStatus = 'ACTIVE' | 'INACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
import {
  GetInventoryResponse,
  UpdateInventoryData,
  UpdateInventoryResponse,
  InventoryItemFormData,
  InventoryItem,
  CreateInventoryResponse,
} from "@/types/inventory";
import { MovementType, Prisma } from "@prisma/client";

interface SearchInventoryParams {
  searchTerm?: string;
  category?: string | null;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function searchInventoryItems({
  searchTerm = "",
  category = null,
  status = "ACTIVE",
  limit = 50,
  offset = 0,
}: SearchInventoryParams): Promise<InventoryItem[]> {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
              { brand: { contains: searchTerm, mode: "insensitive" } },
            ],
          },
          ...(category ? [{ category: category as InventoryCategory }] : []),
          ...(status ? [{ status: status as InventoryStatus }] : []),
        ],
      },
      orderBy: [{ name: "asc" }],
      take: limit,
      skip: offset,
      include: {
        InventoryMovement: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          include: {
            User: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      expirationDate: item.expirationDate?.toISOString() || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      movements: item.InventoryMovement.map((movement) => ({
        ...movement,
        date: movement.date.toISOString(),
        user: movement.User,
      })),
    }));
  } catch (error) {
    console.error("Error searching inventory items:", error);
    return [];
  }
}

export async function getInventory(): Promise<GetInventoryResponse> {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        InventoryMovement: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          include: {
            User: {
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
      movements: item.InventoryMovement.map((movement) => ({
        ...movement,
        date: movement.date.toISOString(),
        user: movement.User,
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
                ? ("LOW_STOCK" as InventoryStatus)
                : data.quantity === 0
                  ? ("OUT_OF_STOCK" as InventoryStatus)
                  : ("ACTIVE" as InventoryStatus)
              : data.status,
        },
      });

      if (
        data.quantity !== undefined &&
        data.quantity !== currentItem.quantity
      ) {
        await tx.inventoryMovement.create({
          data: {
            id: randomUUID(),
            itemId: id,
            type:
              data.quantity > currentItem.quantity
                ? MovementType.IN
                : MovementType.OUT,
            quantity: Math.abs(data.quantity - currentItem.quantity),
            reason: reason || "Manual adjustment",
            date: new Date(),
          } satisfies Prisma.InventoryMovementUncheckedCreateInput,
        });
      }

      return item;
    });

    revalidatePath("/admin/inventario");

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
    if (error instanceof Error && error.message === "No autorizado") {
      return { success: false, error: "No autorizado" };
    }
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
        id: randomUUID(),
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
            ? ("LOW_STOCK" as InventoryStatus)
            : data.quantity === 0
              ? ("OUT_OF_STOCK" as InventoryStatus)
              : ("ACTIVE" as InventoryStatus),
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies Prisma.InventoryItemUncheckedCreateInput,
    });

    if (data.quantity > 0) {
      await prisma.inventoryMovement.create({
        data: {
          id: randomUUID(),
          itemId: newItem.id,
          type: MovementType.IN,
          quantity: data.quantity,
          reason: reason || "Initial stock",
          date: new Date(),
        } satisfies Prisma.InventoryMovementUncheckedCreateInput,
      });
    }

    revalidatePath("/admin/inventario");

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
    if (error instanceof Error && error.message === "No autorizado") {
      return { success: false, error: "No autorizado" };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create inventory item",
    };
  }
}