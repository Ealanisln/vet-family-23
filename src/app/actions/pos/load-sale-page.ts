import { getServices } from "@/app/actions/pos/services";
import { getInventoryForSale } from "@/app/actions/pos/inventory";

// Using string literals instead of importing enums due to type generation issues
type InventoryCategory = 'MEDICINE' | 'SURGICAL_MATERIAL' | 'VACCINE' | 'FOOD' | 'ACCESSORY' | 'CONSUMABLE' | 'ANTI_INFLAMMATORY_ANALGESICS' | 'ANTIBIOTIC' | 'ANTIFUNGAL' | 'DEWORMERS' | 'GASTROPROTECTORS_GASTROENTEROLOGY' | 'CARDIOLOGY' | 'DERMATOLOGY' | 'ENDOCRINOLOGY_HORMONAL' | 'ANESTHETICS_SEDATIVES' | 'OTIC' | 'OINTMENTS' | 'RESPIRATORY' | 'OPHTHALMIC' | 'DRY_FOOD' | 'WET_FOOD' | 'CHIPS' | 'ANTI_EMETIC' | 'ANTISEPTICS_HEALING' | 'NEPHROLOGY' | 'ANTAGONISTS' | 'IMMUNOSTIMULANT' | 'APPETITE_STIMULANTS_HEMATOPOIESIS' | 'SUPPLEMENTS_OTHERS' | 'LAXATIVES' | 'ANTIDIARRHEAL' | 'ANTIHISTAMINE' | 'MEDICATED_SHAMPOO' | 'CORTICOSTEROIDS' | 'EXPECTORANT' | 'BRONCHODILATOR';

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