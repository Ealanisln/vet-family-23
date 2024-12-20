// types.ts
import { InventoryStatus, MovementType, InventoryCategory } from "@prisma/client";

export interface UpdateInventoryData {
  name?: string;
  category?: InventoryCategory;
  description?: string | null;
  activeCompound?: string | null;
  presentation?: string | null;
  measure?: string | null;
  brand?: string | null;
  quantity?: number;
  minStock?: number | null;
  location?: string | null;
  expirationDate?: Date | null;
  status?: InventoryStatus;
  batchNumber?: string | null;
  specialNotes?: string | null;
}

export interface InventoryItemFormData {
  name: string;
  category: InventoryCategory;
  description?: string;
  activeCompound?: string;
  presentation?: string;
  measure?: string;
  brand?: string;
  quantity: number;
  minStock?: number;
  location?: string;
  expirationDate?: string;
  batchNumber?: string;
  specialNotes?: string;
}

interface ServerActionResponse<T> {
  success: boolean;
  error?: string;
  requiresAuth?: boolean;
  item?: T;
  redirectTo?: string;
}