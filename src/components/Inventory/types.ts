import { InventoryStatus, MovementType } from "@prisma/client";

// Enums
export type InventoryCategory =
  | "MEDICINE"
  | "SURGICAL_MATERIAL"
  | "VACCINE"
  | "FOOD"
  | "ACCESSORY"
  | "CONSUMABLE";

// Base interfaces
interface InventoryMovementUser {
  name: string | null;
}

export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  date: string;
  itemId: string;
  reason: string | null;
  userId: string;
  user: InventoryMovementUser | null;
  relatedRecordId: string | null;
  notes: string | null;
}

// Main interface that matches Prisma's output
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  quantity: number;
  minStock: number | null; // Cambiado a nullable para coincidir con Prisma
  location: string | null;
  expirationDate: string | null;
  batchNumber: string | null;
  specialNotes: string | null;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
  movements: InventoryMovement[];
}

// Form interfaces
export type InventoryItemFormData = Omit<
  InventoryItem,
  "id" | "movements" | "status" | "createdAt" | "updatedAt"
>;

export interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: InventoryItem | null;
  onSubmit: (data: InventoryItemFormData) => Promise<void>;
  isSubmitting?: boolean;
}

// Update interface (coincide con el server action)
export interface UpdateInventoryData {
  quantity?: number;
  status?: InventoryStatus;
  location?: string;
  minStock?: number;
}

// Form validation
export interface FormErrors {
  [key: string]: string | undefined;
}

// Server action response types
export interface ServerActionResponse {
  success: boolean;
  items?: InventoryItem[];
  item?: InventoryItem;
  error?: string;
}