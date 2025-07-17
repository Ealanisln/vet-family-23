// src/lib/type-adapters.ts
import type { CartClientProps, CartPetProps } from "@/contexts/CartContext";
import type { Client } from "@/components/Clientes/ClientSearch";
// Manual type definitions due to Prisma client export issues
const InventoryCategory = {
  MEDICINE: 'MEDICINE' as const,
  SURGICAL_MATERIAL: 'SURGICAL_MATERIAL' as const,
  VACCINE: 'VACCINE' as const,
  FOOD: 'FOOD' as const,
  ACCESSORY: 'ACCESSORY' as const,
  CONSUMABLE: 'CONSUMABLE' as const,
  ANTI_INFLAMMATORY_ANALGESICS: 'ANTI_INFLAMMATORY_ANALGESICS' as const,
  ANTIBIOTIC: 'ANTIBIOTIC' as const,
  ANTIFUNGAL: 'ANTIFUNGAL' as const,
  DEWORMERS: 'DEWORMERS' as const,
  GASTROPROTECTORS_GASTROENTEROLOGY: 'GASTROPROTECTORS_GASTROENTEROLOGY' as const,
  CARDIOLOGY: 'CARDIOLOGY' as const,
  DERMATOLOGY: 'DERMATOLOGY' as const,
  ENDOCRINOLOGY_HORMONAL: 'ENDOCRINOLOGY_HORMONAL' as const,
  ANESTHETICS_SEDATIVES: 'ANESTHETICS_SEDATIVES' as const,
  OTIC: 'OTIC' as const,
  OINTMENTS: 'OINTMENTS' as const,
  RESPIRATORY: 'RESPIRATORY' as const,
  OPHTHALMIC: 'OPHTHALMIC' as const,
  DRY_FOOD: 'DRY_FOOD' as const,
  WET_FOOD: 'WET_FOOD' as const,
  CHIPS: 'CHIPS' as const,
  ANTI_EMETIC: 'ANTI_EMETIC' as const,
  ANTISEPTICS_HEALING: 'ANTISEPTICS_HEALING' as const,
  NEPHROLOGY: 'NEPHROLOGY' as const,
  ANTAGONISTS: 'ANTAGONISTS' as const,
  IMMUNOSTIMULANT: 'IMMUNOSTIMULANT' as const,
  APPETITE_STIMULANTS_HEMATOPOIESIS: 'APPETITE_STIMULANTS_HEMATOPOIESIS' as const,
  SUPPLEMENTS_OTHERS: 'SUPPLEMENTS_OTHERS' as const,
};

const InventoryStatus = {
  ACTIVE: 'ACTIVE' as const,
  INACTIVE: 'INACTIVE' as const,
  DISCONTINUED: 'DISCONTINUED' as const,
  OUT_OF_STOCK: 'OUT_OF_STOCK' as const,
  LOW_STOCK: 'LOW_STOCK' as const,
  EXPIRED: 'EXPIRED' as const,
};
import { Pet } from "@/types/pet";

/**
 * Interface for inventory item data that includes price property
 */
export interface InventoryItemWithPrice {
  id: string;
  name: string;
  category: typeof InventoryCategory[keyof typeof InventoryCategory];
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  quantity: number;
  minStock: number | null;
  location: string | null;
  expirationDate: string | null;
  status: typeof InventoryStatus[keyof typeof InventoryStatus];
  batchNumber: string | null;
  specialNotes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string | null;
  price: number;
  cost?: number | null;
}

/**
 * Adapts a Client from ClientSearch to CartClientProps
 */
export function adaptClientToCartClient(
  client: Client | null
): CartClientProps | null {
  if (!client) return null;

  return {
    id: client.id,
    name: client.name || null,
    firstName: client.firstName || null,
    lastName: client.lastName || null,
    email: client.email || null,
    phone: client.phone || null,
  };
}

/**
 * Adapts a Pet from PetSearch to CartPetProps
 */
export function adaptPetToCartPet(pet: Pet | null): CartPetProps | null {
  if (!pet) return null;

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species || undefined,
    breed: pet.breed || undefined,
    userId: pet.userId || "",
    dateOfBirth:
      pet.dateOfBirth instanceof Date
        ? pet.dateOfBirth
        : typeof pet.dateOfBirth === "string"
          ? new Date(pet.dateOfBirth)
          : undefined,
    gender: pet.gender ?? undefined,
    weight: pet.weight, // Ahora es number
    isNeutered: pet.isNeutered, // Ahora es boolean
  };
}

export function adaptCartPetToPet(pet: CartPetProps | null): Pet | null {
  if (!pet) return null;

  return {
    id: pet.id,
    name: pet.name,
    species: pet.species || "",
    breed: pet.breed || "",
    userId: pet.userId,
    dateOfBirth: pet.dateOfBirth || new Date(),
    gender: pet.gender || "",
    weight: pet.weight, // Sin necesidad de ??
    microchipNumber: null, // Valor por defecto
    isNeutered: pet.isNeutered, // Sin necesidad de ??
    isDeceased: false,
    isArchived: false, // Add missing isArchived field
    medicalHistory: [],
    vaccinations: [],
  };
}

/**
 * Adapts CartClientProps to Client for ClientSearch
 */
export function adaptCartClientToClient(
  client: CartClientProps | null
): Client | null {
  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
  };
}

/**
 * Adapts different inventory item types for compatibility
 */
export function adaptInventoryItem(
  item: Record<string, unknown>
): InventoryItemWithPrice {
  return {
    id: typeof item.id === "string" ? item.id : "",
    name: typeof item.name === "string" ? item.name : "",
    category: typeof item.category === "string" ? item.category as typeof InventoryCategory[keyof typeof InventoryCategory] : "MEDICINE" as typeof InventoryCategory[keyof typeof InventoryCategory],
    description: typeof item.description === "string" ? item.description : null,
    activeCompound:
      typeof item.activeCompound === "string" ? item.activeCompound : null,
    presentation:
      typeof item.presentation === "string" ? item.presentation : null,
    measure: typeof item.measure === "string" ? item.measure : null,
    brand: typeof item.brand === "string" ? item.brand : null,
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    minStock: typeof item.minStock === "number" ? item.minStock : null,
    location: typeof item.location === "string" ? item.location : null,
    expirationDate:
      item.expirationDate instanceof Date
        ? item.expirationDate.toISOString()
        : typeof item.expirationDate === "string"
          ? item.expirationDate
          : null,
    status: typeof item.status === "string" ? item.status as typeof InventoryStatus[keyof typeof InventoryStatus] : "ACTIVE" as typeof InventoryStatus[keyof typeof InventoryStatus],
    batchNumber: typeof item.batchNumber === "string" ? item.batchNumber : null,
    specialNotes:
      typeof item.specialNotes === "string" ? item.specialNotes : null,
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt
        : typeof item.createdAt === "string"
          ? item.createdAt
          : new Date().toISOString(),
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt
        : typeof item.updatedAt === "string"
          ? item.updatedAt
          : new Date().toISOString(),
    price: typeof item.price === "number" ? item.price : 0,
    cost: typeof item.cost === "number" ? item.cost : undefined,
  };
}
