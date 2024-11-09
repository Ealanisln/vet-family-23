// app/actions/inventory-actions.ts
"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import {
  InventoryStatus,
  MovementType,
  InventoryCategory,
} from "@prisma/client";

export async function getInventory() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        movements: {
          orderBy: {
            date: 'desc'
          },
          take: 1,
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Convertir fechas a strings para serialización
    const serializedItems = items.map(item => ({
      ...item,
      expirationDate: item.expirationDate?.toISOString() || null,
      movements: item.movements.map(movement => ({
        ...movement,
        date: movement.date.toISOString()
      }))
    }));

    return { success: true, items: serializedItems };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'Failed to fetch inventory' };
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
  userId: string,
  reason?: string
) {
  try {
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!currentItem) {
      throw new Error('Item not found');
    }

    const [updatedItem] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          ...data,
          status: data.quantity !== undefined ? 
            data.quantity <= (data.minStock || currentItem.minStock || 0) 
              ? InventoryStatus.LOW_STOCK 
              : data.quantity === 0 
                ? InventoryStatus.OUT_OF_STOCK 
                : InventoryStatus.ACTIVE
            : data.status
        }
      }),
      ...(data.quantity !== undefined 
        ? [
            prisma.inventoryMovement.create({
              data: {
                itemId: id,
                type: data.quantity > (currentItem.quantity || 0) 
                  ? MovementType.IN 
                  : MovementType.OUT,
                quantity: Math.abs(data.quantity - (currentItem.quantity || 0)),
                userId,
                reason: reason || 'Manual adjustment'
              }
            })
          ]
        : [])
    ]);

    revalidatePath('/inventory');
    return { success: true, item: updatedItem };
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { success: false, error: 'Failed to update inventory' };
  }
}
