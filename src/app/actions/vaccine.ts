"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import {
  InventoryStatus,
  MovementType,
  InventoryCategory,
  type InventoryItem
} from "@prisma/client";
import type { VaccineType } from "@/utils/vaccines";

export interface VaccineItem {
  id: string;
  name: string;
  vaccineType: VaccineType;
  presentation: string | null;
  manufacturer: string | null;
  quantity: number;
  minStock: number | null;
  location: string | null;
  expirationDate: string | null;
  status: "ACTIVE" | "INACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRED";
  batchNumber: string | null;
  specialNotes: string | null;
}

// Mapeo de nombres comunes a tipos de vacunas
const vaccineMapping: Record<string, VaccineType> = {
  "TRIPLE FELINA": "TRIPLE_FELINA",
  "TRIVALENTE FELINA": "TRIPLE_FELINA",
  "TRIPLE VIRAL FELINA": "TRIPLE_FELINA",
  "LEUCEMIA": "LEUCEMIA_FELINA",
  "LEUCEMIA FELINA": "LEUCEMIA_FELINA",
  "FELV": "LEUCEMIA_FELINA",
  "RABIA FELINA": "RABIA_FELINA",
  "RABIA GATO": "RABIA_FELINA",
  "ANTIRRABICA FELINA": "RABIA_FELINA",
};

// Helper function to parse vaccine type from text
function parseVaccineType(text: string): VaccineType {
  const normalizedText = text.toUpperCase().trim();

  // Primero buscar en el mapeo de nombres comunes
  for (const [commonName, vaccineType] of Object.entries(vaccineMapping)) {
    if (normalizedText.includes(commonName)) {
      return vaccineType;
    }
  }

  // Determinar el tipo por defecto basado en si es felina
  if (
    normalizedText.includes("GATO") || 
    normalizedText.includes("FELINA") || 
    normalizedText.includes("FELV")
  ) {
    return "TRIPLE_FELINA";
  }

  // Default a vacuna canina para mantener compatibilidad
  return "DP_PUPPY";
}

export async function getVaccines() {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        category: InventoryCategory.VACCINE
      },
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

    const vaccines: VaccineItem[] = items.map(item => ({
      id: item.id,
      name: item.name,
      vaccineType: parseVaccineType(item.specialNotes || item.name),
      presentation: item.presentation,
      manufacturer: item.brand,
      quantity: item.quantity,
      minStock: item.minStock,
      location: item.location,
      expirationDate: item.expirationDate?.toISOString() || null,
      status: item.status,
      batchNumber: item.batchNumber,
      specialNotes: item.specialNotes
    }));

    return { success: true, items: vaccines };
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    return { success: false, error: 'Failed to fetch vaccines' };
  }
}

interface UpdateVaccineData {
  quantity?: number;
  status?: InventoryStatus;
  location?: string;
  minStock?: number;
  expirationDate?: Date;
  batchNumber?: string;
  manufacturer?: string;
}

export async function updateVaccine(
  id: string,
  data: UpdateVaccineData,
  userId: string,
  reason?: string
) {
  try {
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!currentItem) {
      throw new Error('Vaccine not found');
    }

    const dbData = {
      ...data,
      brand: data.manufacturer,
    };
    delete (dbData as any).manufacturer;

    const [updatedItem] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id },
        data: {
          ...dbData,
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
    console.error('Error updating vaccine:', error);
    return { success: false, error: 'Failed to update vaccine' };
  }
}