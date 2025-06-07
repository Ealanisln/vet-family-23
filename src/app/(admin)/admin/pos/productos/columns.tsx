"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
// import { InventoryCategory } from "@prisma/client";
import { ProductActions } from "./components/product-actions";
import { CATEGORY_TRANSLATIONS } from "@/utils/category-translations";

// Definir el tipo para nuestros productos
export type Product = {
  id: string;
  name: string;
  category: any;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  measure: string;
  presentation: string;
  brand: string;
  margin: string;
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const category = row.getValue("category") as any;
      return CATEGORY_TRANSLATIONS[category] || category;
    }
  },
  {
    accessorKey: "presentation",
    header: "Presentación",
  },
  {
    accessorKey: "measure",
    header: "Medida",
  },
  {
    accessorKey: "quantity",
    header: "Stock",
  },
  {
    accessorKey: "cost",
    header: "Costo",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"));
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);
    }
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);
    }
  },
  {
    accessorKey: "margin",
    header: "Margen",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <ProductActions product={row.original} />
      )
    }
  }
]; 