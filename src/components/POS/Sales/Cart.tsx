// src/components/POS/Sales/Cart.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/types/pos";

interface CartProps {
  items: CartItem[];
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
}

export default function Cart({ items, updateQuantity, removeItem }: CartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-gray-500">Carrito vacío</h3>
        <p className="text-sm text-gray-400">Agrega productos o servicios para comenzar</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-3">Carrito de venta</h3>
      <div className="divide-y max-h-[400px] overflow-y-auto">
        {items.map((item, index) => (
          <div key={`${item.type}-${item.id}-${index}`} className="py-3 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant={item.type === 'product' ? 'default' : 'secondary'} className="text-xs">
                    {item.type === 'product' ? 'Producto' : 'Servicio'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                <div className="flex items-center mt-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                  >
                    <span>-</span>
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                    className="h-7 w-12 text-center mx-1 p-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                  >
                    <span>+</span>
                  </Button>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                <span className="text-xs text-gray-500">${item.unitPrice.toFixed(2)} c/u</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}