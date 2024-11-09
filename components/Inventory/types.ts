// types/inventory.ts
import { InventoryCategory, InventoryStatus, MovementType } from '@prisma/client';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock: number | null;
  status: InventoryStatus;
  expirationDate: string | null;
  location: string | null;
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  movements: Array<{
    id: string;
    type: MovementType;
    quantity: number;
    date: string;
    user: {
      name: string | null;
    } | null;
  }>;
}

export interface UpdateInventoryData {
  quantity?: number;
  status?: InventoryStatus;
  location?: string;
  minStock?: number;
}
