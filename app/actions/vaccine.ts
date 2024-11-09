// app/actions/vaccine-actions.ts
"use server";

import { prisma } from "@/lib/prismaDB";
import { revalidatePath } from "next/cache";
import {
  InventoryStatus,
  MovementType,
  InventoryCategory,
  type InventoryItem
} from "@prisma/client";

export interface VaccineItem {
  id: string;
  name: string;
  vaccineType: 
    | "DP_PUPPY"
    | "DHPPI"
    | "DHPPI_L"
    | "DHPPI_RL"
    | "BORDETELLA"
    | "SEXTUPLE"
    | "SEXTUPLE_R"
    | "RABIES";
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

    // Transform inventory items to vaccine-specific format
    const vaccines: VaccineItem[] = items.map(item => {
      // Parse vaccineType from specialNotes or name
      const vaccineType = parseVaccineType(item.specialNotes || item.name);
      
      return {
        id: item.id,
        name: item.name,
        vaccineType,
        presentation: item.presentation,
        manufacturer: item.brand, // Map brand to manufacturer
        quantity: item.quantity,
        minStock: item.minStock,
        location: item.location,
        expirationDate: item.expirationDate?.toISOString() || null,
        status: item.status,
        batchNumber: item.batchNumber,
        specialNotes: item.specialNotes
      };
    });

    return { success: true, items: vaccines };
  } catch (error) {
    console.error('Error fetching vaccines:', error);
    return { success: false, error: 'Failed to fetch vaccines' };
  }
}

// Helper function to parse vaccine type from text
function parseVaccineType(text: string): VaccineItem["vaccineType"] {
  const types: VaccineItem["vaccineType"][] = [
    "DP_PUPPY",
    "DHPPI",
    "DHPPI_L",
    "DHPPI_RL",
    "BORDETELLA",
    "SEXTUPLE",
    "SEXTUPLE_R",
    "RABIES"
  ];

  for (const type of types) {
    if (text.toUpperCase().includes(type.replace("_", " "))) {
      return type;
    }
  }

  // Default to first vaccine type if no match found
  // You might want to handle this differently based on your needs
  return "DP_PUPPY";
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

    // Convert manufacturer to brand for database
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