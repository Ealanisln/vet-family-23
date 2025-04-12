// src/types/inventory.ts

import { InventoryStatus, MovementType } from "@prisma/client";

// Enums y Types Base
export type InventoryCategory =
  | "ACCESSORY"
  | "ANESTHETICS_SEDATIVES"
  | "ANTAGONISTS"
  | "ANTI_EMETIC"
  | "ANTI_INFLAMMATORY_ANALGESICS"
  | "ANTIBIOTIC"
  | "ANTIDIARRHEAL"
  | "ANTIFUNGAL"
  | "ANTIHISTAMINE"
  | "ANTISEPTICS_HEALING"
  | "APPETITE_STIMULANTS_HEMATOPOIESIS"
  | "BRONCHODILATOR"
  | "CARDIOLOGY"
  | "CHIPS"
  | "CONSUMABLE"
  | "CORTICOSTEROIDS"
  | "DERMATOLOGY"
  | "DEWORMERS"
  | "DRY_FOOD"
  | "ENDOCRINOLOGY_HORMONAL"
  | "EXPECTORANT"
  | "FOOD"
  | "GASTROPROTECTORS_GASTROENTEROLOGY"
  | "IMMUNOSTIMULANT"
  | "LAXATIVES"
  | "MEDICATED_SHAMPOO"
  | "MEDICINE"
  | "NEPHROLOGY"
  | "OINTMENTS"
  | "OPHTHALMIC"
  | "OTIC"
  | "RESPIRATORY"
  | "SUPPLEMENTS_OTHERS"
  | "SURGICAL_MATERIAL"
  | "VACCINE"
  | "WET_FOOD";

// Interfaces Base
export interface InventoryMovementUser {
  name: string | null;
}

// Movimiento base (servidor)
export interface InventoryMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  date: string;
  reason: string | null;
  userId: string | null;
  user: InventoryMovementUser | null;
  relatedRecordId: string | null;
  notes: string | null;
}

// Base común para ambos tipos de items
export interface InventoryItemBase {
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
  price: number | null;  // Added price field
  cost: number | null;   // Added cost field
  location: string | null;
  expirationDate: string | null;
  batchNumber: string | null;
  specialNotes: string | null;
  status: InventoryStatus;
}

// Item del servidor (con fechas como string)
export interface InventoryItem extends InventoryItemBase {
  movements: InventoryMovement[];
  createdAt: string;
  updatedAt: string | null;
}

// Item del formulario (con fechas como Date)
export interface InventoryFormItem extends InventoryItemBase {
  movements: Array<Omit<InventoryMovement, 'date'> & { date: string | Date }>;
  createdAt: string | Date;
  updatedAt: string | Date | null;
}

// Tipos para el Formulario
export type InventoryItemFormData = {
  name: string;
  category: InventoryCategory;
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  quantity: number;
  minStock: number | null;
  price?: number | null;  // Added price field
  cost?: number | null;   // Added cost field
  location: string | null;
  expirationDate: string | null;
  batchNumber: string | null;
  specialNotes: string | null;
};

export interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: InventoryItem | InventoryFormItem | null;
  onSubmit: (data: InventoryItemFormData) => Promise<void>;
  isSubmitting?: boolean;
  category?: InventoryCategory; // Add this optional prop
}


// Tipos para Actualizaciones
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
  price?: number | null;  // Added price field
  cost?: number | null;   // Added cost field
  location?: string | null;
  expirationDate?: string | null;
  batchNumber?: string | null;
  specialNotes?: string | null;
  status?: InventoryStatus;
}

// Respuestas del Servidor
export interface ServerResponse {
  success: boolean;
  error?: string;
  requiresAuth?: boolean;
}

export interface GetInventoryResponse extends ServerResponse {
  items?: InventoryItem[];
}

export interface UpdateInventoryResponse extends ServerResponse {
  item?: InventoryItem;
}

export interface CreateInventoryResponse extends ServerResponse {
  item?: InventoryItem;
  redirectTo?: string;
}

// Tipos para Filtros y Búsqueda
export interface InventoryFilters {
  category?: InventoryCategory;
  status?: InventoryStatus;
  search?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Tipos para Paginación
export interface PaginationParams {
  page: number;
  limit: number;
}

// Tipos para Ordenamiento
export interface SortParams {
  field: keyof InventoryItem;
  direction: 'asc' | 'desc';
}

// Tipos para Movimientos
export interface CreateMovementData {
  type: MovementType;
  quantity: number;
  reason?: string;
  notes?: string;
  relatedRecordId?: string;
}

// Tipos para Validación
export interface ValidationResponse {
  isValid: boolean;
  errors: FormErrors;
}

// Search inventory params
export interface SearchInventoryParams {
  searchTerm?: string;
  category?: string | null;
  status?: string;
  limit?: number;
  offset?: number;
}

export { InventoryStatus };