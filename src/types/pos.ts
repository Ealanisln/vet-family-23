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

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration?: number;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
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
  inventoryItem?: any | null;
  service?: Service | null;
}

export interface CashDrawer {
  id: string;
  openedAt: Date;
  closedAt?: Date;
  openedBy: string;
  closedBy?: string;
  initialAmount: number;
  finalAmount?: number;
  expectedAmount?: number;
  difference?: number;
  status: DrawerStatus;
  notes?: string;
  openUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  closeUser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  transactions: CashTransaction[];
}

export interface CashTransaction {
  id: string;
  drawerId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  createdAt: Date;
  saleId?: string | null;
  sale?: Sale | null;
}