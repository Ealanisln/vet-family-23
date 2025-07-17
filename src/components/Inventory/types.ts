// import { InventoryFormItem } from "@/types/inventory";
// Manual type definitions due to Prisma client export issues
const InventoryStatus = {
  ACTIVE: 'ACTIVE' as const,
  INACTIVE: 'INACTIVE' as const,
  DISCONTINUED: 'DISCONTINUED' as const,
  OUT_OF_STOCK: 'OUT_OF_STOCK' as const,
  LOW_STOCK: 'LOW_STOCK' as const,
};

const MovementType = {
  IN: 'IN' as const,
  OUT: 'OUT' as const,
  ADJUSTMENT: 'ADJUSTMENT' as const,
  RETURN: 'RETURN' as const,
};

// Enums
export type InventoryCategory =
  | "MEDICINE"
  | "SURGICAL_MATERIAL"
  | "VACCINE"
  | "FOOD"
  | "ACCESSORY"
  | "CONSUMABLE"
    // New categories below
  | "ANTI_INFLAMMATORY_ANALGESICS"
  | "ANTIBIOTIC"
  | "ANTIFUNGAL"
  | "DEWORMERS"
  | "GASTROPROTECTORS_GASTROENTEROLOGY"
  | "CARDIOLOGY"
  | "DERMATOLOGY"
  | "ENDOCRINOLOGY_HORMONAL"
  | "ANESTHETICS_SEDATIVES"
  | "OTIC"
  | "OINTMENTS"
  | "RESPIRATORY"
  | "OPHTHALMIC"
  | "DRY_FOOD"
  | "WET_FOOD"
  | "CHIPS"
  | "ANTI_EMETIC"
  | "ANTISEPTICS_HEALING"
  | "NEPHROLOGY"
  | "ANTAGONISTS"
  | "IMMUNOSTIMULANT"
  | "APPETITE_STIMULANTS_HEMATOPOIESIS"
  | "SUPPLEMENTS_OTHERS";

// Add validation type for category checking
export const INVENTORY_CATEGORIES = [
  "MEDICINE",
  "SURGICAL_MATERIAL",
  "VACCINE",
  "FOOD",
  "ACCESSORY",
  "CONSUMABLE",
  "ANTI_INFLAMMATORY_ANALGESICS",
  "ANTIBIOTIC",
  "ANTIFUNGAL",
  "DEWORMERS",
  "GASTROPROTECTORS_GASTROENTEROLOGY",
  "CARDIOLOGY",
  "DERMATOLOGY",
  "ENDOCRINOLOGY_HORMONAL",
  "ANESTHETICS_SEDATIVES",
  "OTIC",
  "OINTMENTS",
  "RESPIRATORY",
  "OPHTHALMIC",
  "DRY_FOOD",
  "WET_FOOD",
  "CHIPS",
  "ANTI_EMETIC",
  "ANTISEPTICS_HEALING",
  "NEPHROLOGY",
  "ANTAGONISTS",
  "IMMUNOSTIMULANT",
  "APPETITE_STIMULANTS_HEMATOPOIESIS",
  "SUPPLEMENTS_OTHERS",
] as const;

// Type guard for category validation
export function isValidCategory(category: string): category is InventoryCategory {
  return INVENTORY_CATEGORIES.includes(category as InventoryCategory);
}

// Base interfaces
interface InventoryMovementUser {
  name: string | null;
}

export interface InventoryMovement {
  id: string;
  type: typeof MovementType[keyof typeof MovementType];
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
  status: typeof InventoryStatus[keyof typeof InventoryStatus];
  createdAt: Date;
  updatedAt: Date;
  movements: InventoryMovement[];
}

// Form interfaces
export type InventoryItemFormData = Omit<
  InventoryItem,
  "id" | "movements" | "status" | "createdAt" | "updatedAt"
> & {
  expirationDate?: string | null; // Match date input format
};

// interface InventoryFormProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   initialData: InventoryFormItem | null;
//   onSubmit: (data: InventoryItemFormData) => Promise<void>;
//   isSubmitting?: boolean;
// }

// Unified interface for inventory updates
export interface UpdateInventoryData {
  quantity?: number;
  status?: typeof InventoryStatus[keyof typeof InventoryStatus];
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
  type: typeof MovementType[keyof typeof MovementType];
  quantity: number;
  reason?: string;
  notes?: string;
  relatedRecordId?: string;
}

// Search and filter types
export interface InventoryFilters {
  category?: InventoryCategory | 'ALL_MEDICINE'; // Add special filter group
  status?: typeof InventoryStatus[keyof typeof InventoryStatus];
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

// Add helper type for category groups
export type MedicineSubcategories = Extract<InventoryCategory,
  | "MEDICINE"
  | "ANTI_INFLAMMATORY_ANALGESICS"
  | "ANTIBIOTIC"
  | "ANTIFUNGAL"
  | "DEWORMERS"
  | "GASTROPROTECTORS_GASTROENTEROLOGY"
  | "CARDIOLOGY"
  | "DERMATOLOGY"
  | "ENDOCRINOLOGY_HORMONAL"
  | "ANESTHETICS_SEDATIVES"
  | "OTIC"
  | "OINTMENTS"
  | "RESPIRATORY"
  | "OPHTHALMIC"
  | "ANTI_EMETIC"
  | "ANTISEPTICS_HEALING"
  | "NEPHROLOGY"
  | "ANTAGONISTS"
  | "IMMUNOSTIMULANT"
  | "APPETITE_STIMULANTS_HEMATOPOIESIS"
  | "SUPPLEMENTS_OTHERS"
>;