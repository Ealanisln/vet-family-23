import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDeletedInventoryItems } from "@/app/actions/inventory";
import { DeletedInventoryTable } from "@/components/Inventory/DeletedInventoryTable";
import { Archive } from "lucide-react";

// Category constants
const CATEGORIES = {
  ALL: null,
  MEDICINE: "MEDICINE",
  VACCINE: "VACCINE",
  SURGICAL_MATERIAL: "SURGICAL_MATERIAL",
  FOOD: "FOOD",
  ANTIBIOTIC: "ANTIBIOTIC",
  DEWORMERS: "DEWORMERS",
} as const;

const CATEGORY_LABELS = {
  ALL: "Todos",
  MEDICINE: "Medicinas",
  VACCINE: "Vacunas",
  SURGICAL_MATERIAL: "Material Quirúrgico",
  FOOD: "Alimentos",
  ANTIBIOTIC: "Antibióticos",
  DEWORMERS: "Desparasitantes",
} as const;

export default async function DeletedInventoryPage() {
  // Fetch all deleted items
  const result = await getDeletedInventoryItems();

  if (!result.success || !result.items) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-2 mb-6">
          <Archive className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Items Eliminados</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">Error al cargar los items eliminados.</p>
        </div>
      </div>
    );
  }

  const allItems = result.items;

  // Filter items by category
  const getItemsByCategory = (category: keyof typeof CATEGORIES) => {
    if (category === "ALL") return allItems;
    return allItems.filter((item) => item.category === CATEGORIES[category]);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Archive className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Items Eliminados</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        Los items eliminados se muestran aquí y pueden ser restaurados al
        inventario activo.
      </p>

      <Tabs defaultValue="ALL" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {getItemsByCategory(key as keyof typeof CATEGORIES).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(CATEGORIES).map((category) => (
          <TabsContent key={category} value={category}>
            <DeletedInventoryTable
              items={getItemsByCategory(category as keyof typeof CATEGORIES)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
