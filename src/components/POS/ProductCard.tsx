// src/components/pos/ProductCard.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, TrendingUp } from "lucide-react";
import { translateInventoryCategory } from "@/utils/pos-helpers";
import { formatCurrency } from "@/utils/pos-helpers";
import { calculateMargin } from "@/app/actions/pos/inventory-price";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    quantity: number;
    price: number | null;
    cost: number | null;
    [key: string]: any;
  };
  showCost?: boolean;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, showCost = false, onAddToCart }: ProductCardProps) {
  // Función para obtener el precio de forma segura
  const getProductPrice = (): number => {
    return product.price !== undefined && product.price !== null ? product.price : 0;
  };
  
  // Función para obtener el costo de forma segura
  const getProductCost = (): number | null => {
    return product.cost !== undefined && product.cost !== null ? product.cost : null;
  };
  
  // Calcular margen si ambos valores están disponibles
  const cost = getProductCost();
  const price = getProductPrice();
  const margin = calculateMargin(price, cost);
  
  // Manejar clic en añadir al carrito
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-1">
          <Badge variant="outline" className="text-xs mb-1">
            {translateInventoryCategory(product.category)}
          </Badge>
        </div>
        
        <h3 className="font-medium text-base mb-1">{product.name}</h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-grow">
          {product.description || "Sin descripción"}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t">
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-semibold text-green-600">
              {formatCurrency(price)}
            </span>
            
            {margin !== null && margin > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-100 cursor-default">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {margin}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Margen de ganancia: {margin}%</p>
                    {showCost && (
                      <p className="text-xs">Costo: {formatCurrency(cost || 0)}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center">
            {product.quantity <= 10 && (
              <div className="text-xs text-amber-600 mr-2 flex items-center">
                <span className="text-amber-600 mr-1">Stock:</span>
                <span className="font-medium">{product.quantity}</span>
              </div>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAddToCart}
              disabled={product.quantity <= 0}
            >
              <Plus className="h-3 w-3 mr-1" /> Agregar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}