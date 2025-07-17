import { prisma } from "@/lib/prismaDB";

// Manual type definitions due to Prisma client export issues
type Sale = {
  id: string;
  userId: string;
  petId: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
  notes: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

type SaleItem = {
  id: string;
  saleId: string;
  itemId: string | null;
  serviceId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type User = {
  id: string;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
  pet: string | null;
  visits: number;
  nextVisitFree: boolean;
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Pet = {
  id: string;
  internalId: string | null;
  userId: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  isNeutered: boolean;
  isDeceased: boolean;
  isArchived: boolean;
};

export type FullSaleDetails = Sale & {
  items: SaleItem[];
  user?: User | null;
  pet?: Pet | null;
};

export type GetSaleDetailsResult = {
  success: true;
  data: FullSaleDetails;
} | {
  success: false;
  error: string;
};

export async function getSaleDetailsById(saleId: string): Promise<GetSaleDetailsResult> {
  try {
    // Define the expected shape including relations
    type ExpectedSaleResult = Sale & {
        SaleItem: SaleItem[];
        User: User | null;
        Pet: Pet | null;
    };

    const saleWithIncludes = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        SaleItem: true,
        User: true,
        Pet: true,
      },
    }) as ExpectedSaleResult | null;

    if (!saleWithIncludes) {
      return {
        success: false,
        error: "Sale not found",
      };
    }

    const { SaleItem, User, Pet, ...restOfSale } = saleWithIncludes;
    const saleDetails: FullSaleDetails = {
      ...restOfSale,
      items: SaleItem,
      user: User,
      pet: Pet,
    };

    return {
      success: true,
      data: saleDetails,
    };
  } catch (error) {
    console.error("Error getting sale details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
} 