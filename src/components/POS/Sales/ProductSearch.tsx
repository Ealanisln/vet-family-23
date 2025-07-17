// src/components/POS/Sales/ProductSearch.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { searchInventoryItems } from "@/app/actions/inventory";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFilter } from "@/components/Inventory/CategoryFilter";
import type { InventoryItem } from "@/types/inventory";
// Manual type definitions due to Prisma client export issues
const InventoryCategory = {
  MEDICINE: 'MEDICINE' as const,
  SURGICAL_MATERIAL: 'SURGICAL_MATERIAL' as const,
  VACCINE: 'VACCINE' as const,
  FOOD: 'FOOD' as const,
  ACCESSORY: 'ACCESSORY' as const,
  CONSUMABLE: 'CONSUMABLE' as const,
  ANTI_INFLAMMATORY_ANALGESICS: 'ANTI_INFLAMMATORY_ANALGESICS' as const,
  ANTIBIOTIC: 'ANTIBIOTIC' as const,
  ANTIFUNGAL: 'ANTIFUNGAL' as const,
  DEWORMERS: 'DEWORMERS' as const,
  GASTROPROTECTORS_GASTROENTEROLOGY: 'GASTROPROTECTORS_GASTROENTEROLOGY' as const,
  CARDIOLOGY: 'CARDIOLOGY' as const,
  DERMATOLOGY: 'DERMATOLOGY' as const,
  ENDOCRINOLOGY_HORMONAL: 'ENDOCRINOLOGY_HORMONAL' as const,
  ANESTHETICS_SEDATIVES: 'ANESTHETICS_SEDATIVES' as const,
  OTIC: 'OTIC' as const,
  OINTMENTS: 'OINTMENTS' as const,
  RESPIRATORY: 'RESPIRATORY' as const,
  OPHTHALMIC: 'OPHTHALMIC' as const,
  DRY_FOOD: 'DRY_FOOD' as const,
  WET_FOOD: 'WET_FOOD' as const,
  CHIPS: 'CHIPS' as const,
  ANTI_EMETIC: 'ANTI_EMETIC' as const,
  ANTISEPTICS_HEALING: 'ANTISEPTICS_HEALING' as const,
  NEPHROLOGY: 'NEPHROLOGY' as const,
  ANTAGONISTS: 'ANTAGONISTS' as const,
  IMMUNOSTIMULANT: 'IMMUNOSTIMULANT' as const,
  APPETITE_STIMULANTS_HEMATOPOIESIS: 'APPETITE_STIMULANTS_HEMATOPOIESIS' as const,
  SUPPLEMENTS_OTHERS: 'SUPPLEMENTS_OTHERS' as const,
};
import { translateInventoryCategory } from "@/utils/pos-helpers";

interface ProductSearchProps {
  onSelectProduct: (product: InventoryItem) => void;
}

export default function ProductSearch({ onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof InventoryCategory[keyof typeof InventoryCategory] | "all_categories">("all_categories");
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await searchInventoryItems({
          searchTerm,
          category: selectedCategory === "all_categories" ? null : selectedCategory,
          status: "ACTIVE", // Solo productos activos
          limit: 24,
        });
        setProducts(result);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce para evitar demasiadas llamadas durante la escritura
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(handler);
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (value: typeof InventoryCategory[keyof typeof InventoryCategory] | "all_categories") => {
    setSelectedCategory(value);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar productos por nombre, categoría..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <CategoryFilter
        value={selectedCategory}
        onChange={handleCategoryChange}
      />
      
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex flex-col h-full">
                      <div>
                        <h3 className="font-medium truncate" title={`${product.name}${product.measure ? ` - ${product.measure}` : ''}`}>
                          {product.name}{product.measure ? ` - ${product.measure}` : ''}
                        </h3>
                        <div className="text-sm text-gray-500 truncate" title={product.description || ""}>
                          {product.description || ""}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {translateInventoryCategory(product.category)}
                          </Badge>
                          <span className="font-semibold">${product.price !== undefined && typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Stock: {product.quantity}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                        onClick={() => onSelectProduct(product)}
                        disabled={product.quantity <= 0}
                      >
                        {product.quantity <= 0 ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Sin stock
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Agregar al carrito
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <p className="text-gray-500">No se encontraron productos con los criterios de búsqueda.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}