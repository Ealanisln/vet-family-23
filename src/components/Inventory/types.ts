import { InventoryFormItem } from "@/types/inventory";
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
  minStock: number | null;
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

interface InventoryFormProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  initialData: InventoryFormItem | null;

  onSubmit: (data: InventoryItemFormData) => Promise<void>;

  isSubmitting?: boolean;
}

// Unified interface for inventory updates
export interface UpdateInventoryData {
  quantity?: number;
  status?: InventoryStatus;
  location?: string | null;
  minStock?: number | null;
  name?: string;
  category?: InventoryCategory;
  description?: string | null;
  activeCompound?: string | null;
  presentation?: string | null;
  measure?: string | null;
  brand?: string | null;
  batchNumber?: string | null;
  specialNotes?: string | null;
  expirationDate?: Date | null;
}

// Server action response types
export interface ServerActionResponse {
  success: boolean;
  items?: InventoryItem[];
  item?: InventoryItem;
  error?: string;
  requiresAuth?: boolean;
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
  requiresAuth?: boolean;
}

// Movement-specific types
export interface CreateMovementData {
  type: MovementType;
  quantity: number;
  reason?: string;
  notes?: string;
  relatedRecordId?: string;
}

// Search and filter types
export interface InventoryFilters {
  category?: InventoryCategory;
  status?: InventoryStatus;
  search?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

// Sort types
export interface SortParams {
  field: keyof InventoryItem;
  direction: "asc" | "desc";
}

export interface UpdateInventoryResult {
  success: boolean;
  error?: string;
  item?: InventoryItem;
  requiresAuth?: boolean;
}
