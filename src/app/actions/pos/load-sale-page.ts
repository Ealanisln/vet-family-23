import { getServices } from "@/app/actions/pos/services";
import { getInventoryForSale } from "@/app/actions/pos/inventory";
import { InventoryCategory } from "@prisma/client";

export type SalePageData = {
  services: Awaited<ReturnType<typeof getServices>>['services'];
  inventoryResult: Awaited<ReturnType<typeof getInventoryForSale>>;
};

export async function loadSalePageData({
  category,
  search,
  page,
}: {
  category?: string;
  search?: string;
  page?: string;
}): Promise<SalePageData> {
  const servicesResult = await getServices({ isActive: true });
  const inventoryResult = await getInventoryForSale({
    category: category as InventoryCategory | undefined,
    searchTerm: search,
    page: page ? parseInt(page) : 1,
    limit: 8,
  });

  return {
    services: servicesResult.services,
    inventoryResult,
  };
} 