// src/types/pos.ts

export type PaymentMethod = 
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
  | "MOBILE_PAYMENT"
  | "MULTIPLE";

export type SaleStatus = 
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type ServiceCategory = 
  | "CONSULTATION"
  | "SURGERY"
  | "VACCINATION"
  | "GROOMING"
  | "DENTAL"
  | "LABORATORY"
  | "IMAGING"
  | "HOSPITALIZATION"
  | "OTHER";

export type DrawerStatus = 
  | "OPEN"
  | "CLOSED"
  | "RECONCILED";

export type TransactionType = 
  | "SALE"
  | "REFUND"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "ADJUSTMENT";

export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleItemData {
  itemId: string | null;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleFormData {
  userId?: string;
  petId?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes?: string;
  items: SaleItemData[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  activeCompound?: string | null;
  presentation?: string | null;
  measure?: string | null;
  brand?: string | null;
  quantity: number;
  minStock?: number | null;
  location?: string | null;
  expirationDate?: Date | null;
  status: string;
  batchNumber?: string | null;
  specialNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  price: number;
  duration?: number | null;
  isActive: boolean;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  date: Date;
  userId: string | null;
  petId: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
  } | null;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  itemId: string | null;
  serviceId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  inventoryItem?: InventoryItem | null;
  service?: Service | null;
}

export interface CashDrawer {
  id: string;
  openedAt: Date;
  closedAt?: Date | null;
  openedBy: string;
  closedBy?: string | null;
  initialAmount: number;
  finalAmount?: number | null;
  expectedAmount?: number | null;
  difference?: number | null;
  status: DrawerStatus;
  notes?: string | null;
  openUser: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  closeUser?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  transactions: CashTransaction[];
}

export interface CashTransaction {
  id: string;
  drawerId: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  createdAt: Date;
  saleId?: string | null;
  sale?: Sale | null;
}