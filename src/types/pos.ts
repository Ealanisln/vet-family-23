// src/types/pos.ts

// Basic type definitions for Prisma models
interface PrismaCashDrawer {
  id: string;
  initialAmount: number;
  openedAt: Date;
  closedAt?: Date | null;
  openedBy?: string | null;
  closedBy?: string | null;
  finalAmount?: number | null;
  expectedAmount?: number | null;
  difference?: number | null;
  status: string;
  notes?: string | null;
}

interface PrismaCashTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: Date;
  saleId?: string | null;
}

interface PrismaUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

// Enums as string literal types
export type PaymentMethod = 
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "TRANSFER"
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

// Core interfaces
export interface CartItem {
  id: string; 
  type: 'product' | 'service';
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category?: string;
  activeCompound?: string;
  stock?: number;
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
  status: SaleStatus;
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
  updatedAt: Date | null;
  price: number;
  cost?: number | null;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  price: number;
  duration: number | null;
  isActive: boolean; // This is the correct property name, not 'active'
  createdAt: Date;
  updatedAt: Date;
}

// Extended service interfaces with related data
export interface ServiceWithSales extends Service {
  sales: Array<{
    id: string;
    date: string | Date;
    customer?: { name?: string } | null;
    price: number;
    saleId: string;
  }>;
}

export interface ServiceWithProducts extends Service {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ServiceWithRelations extends Partial<ServiceWithSales>, Partial<ServiceWithProducts> {
  sales?: Array<{
    id: string;
    date: string | Date;
    customer?: { name?: string } | null;
    price: number;
    saleId: string;
  }>;
  products?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

// Basic sale list item type (for tables and lists)
export interface SaleListItem {
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
  User?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
  Pet?: {
    id: string;
    name: string;
    species: string;
    breed: string;
  } | null;
}

// Type for successful sale creation result
export interface CreateSaleSuccessResult {
  success: true;
  sale: Sale;
}

// Full sale detail type (with items)
export interface Sale extends SaleListItem {
  SaleItem: SaleItem[];
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

// Define the shape returned by getCurrentDrawer action
export type CurrentDrawerData = (PrismaCashDrawer & {
  openUser: Pick<PrismaUser, 'id' | 'firstName' | 'lastName' | 'email'>;
  transactions: PrismaCashTransaction[];
}) | null;

// Simplified Transaction Type for UI
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: Date;
  saleId?: string | null; // Optional sale relation
}

// Custom CashDrawer type for client-side usage
export interface CashDrawer {
  id: string;
  initialAmount: number;
  openedAt: Date;
  closedAt?: Date | null;
  openedBy?: string | null; // Made optional
  closedBy?: string | null;
  finalAmount?: number | null;
  expectedAmount?: number | null;
  difference?: number | null;
  status: string;
  notes?: string | null;
  transactions: Transaction[]; // Use simplified transaction type
  openUser?: Pick<PrismaUser, 'id' | 'firstName' | 'lastName' | 'email'>; // Add optional openUser based on CurrentDrawerData
}