// src/components/pos/ProductCard.tsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { translateInventoryCategory } from "@/utils/pos-helpers";
import { formatCurrency } from "@/utils/pos-helpers";
import { calculateMargin } from "@/app/actions/pos/inventory-price";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { InventoryItem, CartItem } from "@/types/pos";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: InventoryItem;
  showCost?: boolean;
  onAddToCart?: (product: InventoryItem) => void;
  className?: string;
}

export function ProductCard({
  product,
  showCost = false,
  onAddToCart,
  className,
}: ProductCardProps) {
  // Obtener el precio y costo de forma segura
  const price = product.price ?? 0;
  const cost = product.cost ?? null;
  const [margin, setMargin] = React.useState<number | null>(null);

  React.useEffect(() => {
    const getMargin = async () => {
      const calculatedMargin = await calculateMargin(price, cost);
      setMargin(calculatedMargin);
    };
    getMargin();
  }, [price, cost]);

  // Determinar si hay stock bajo
  const hasLowStock = product.quantity <= (product.minStock ?? 10);
  const isOutOfStock = product.quantity <= 0;

  // Manejar clic en añadir al carrito
  const handleAddToCart = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(product);
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden h-full transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Encabezado con categoría */}
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs">
            {translateInventoryCategory(product.category)}
          </Badge>

          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Sin stock
            </Badge>
          )}
        </div>

        {/* Nombre y descripción */}
        <h3 className="font-medium text-base mb-1 line-clamp-1">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-grow">
          {product.description || "Sin descripción"}
        </p>

        {/* Información adicional si existe */}
        {product.activeCompound && (
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">Comp. activo:</span>{" "}
            {product.activeCompound}
          </div>
        )}

        {product.presentation && (
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">Presentación:</span>{" "}
            {product.presentation}
          </div>
        )}

        {/* Pie de tarjeta con precio y acciones */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-semibold text-green-600">
              {formatCurrency(price)}
            </span>

            {margin !== null && margin > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-100 cursor-default">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {margin}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="p-2">
                    <p className="text-xs">Margen de ganancia: {margin}%</p>
                    {showCost && cost !== null && (
                      <p className="text-xs">Costo: {formatCurrency(cost)}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasLowStock && !isOutOfStock && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-amber-600 flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      <span className="font-medium">{product.quantity}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Stock bajo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              size="sm"
              variant={isOutOfStock ? "ghost" : "outline"}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "text-sm gap-1 transition-colors",
                !isOutOfStock &&
                  "hover:bg-green-50 hover:text-green-700 hover:border-green-200"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Función auxiliar para convertir un InventoryItem a CartItem
export function createCartItemFromProduct(product: InventoryItem): CartItem {
  return {
    id: product.id,
    type: "product",
    name: product.name,
    description: product.description || product.name || "",
    quantity: 1,
    unitPrice: product.price || 0,
  };
}
