import { prisma } from "@/lib/prismaDB";
import type { Sale, SaleItem, User, Pet } from "@prisma/client";

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