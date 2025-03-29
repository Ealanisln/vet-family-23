// src/components/pos/CartSummary.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X, AlertTriangle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/pos-helpers';
import type { CartItem } from '@/types/pos';

interface CartSummaryProps {
  className?: string;
}

export function CartSummary({ className }: CartSummaryProps) {
  const {
    state,
    removeItem,
    updateQuantity,
    subtotal,
    tax,
    total
  } = useCart();

  // Función auxiliar tipada correctamente
  // Retorna undefined si no aplica stock (servicios o producto sin stock definido)
  const getAvailableStock = (item: CartItem): number | undefined => {
      if (item.type === 'product') {
          // Usa la propiedad 'stock' añadida a CartItem
          return item.stock;
      }
      return undefined; // Los servicios no tienen stock
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-base">Artículos en la venta</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {state.items.length === 0 ? (
          <div className="min-h-[180px] flex items-center justify-center p-6">
            <p className="text-gray-400 text-sm">No hay artículos seleccionados</p>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {state.items.map((item) => {
                // Obtener el stock disponible (puede ser undefined)
                const availableStock = getAvailableStock(item);
                // El warning aparece si hay stock definido y la cantidad lo excede
                const hasStockWarning = typeof availableStock === 'number' && item.quantity > availableStock;
                // El botón + se deshabilita si hay stock definido y la cantidad es >= a él
                const isStockLimited = typeof availableStock === 'number';

                return (
                  <div key={item.id} className="p-3"> {/* Usa item.id como key */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="flex items-start justify-between">
                          {/* Usa item.name */}
                          <div className="font-medium">{item.name}</div>
                          <button
                            // Usa item.id
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 -m-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5">
                          {/* Usa item.category si existe, si no el tipo */}
                          {item.category ? item.category : item.type}
                          {/* Usa item.activeCompound si existe */}
                          {item.activeCompound && ` - ${item.activeCompound}`}
                        </div>

                        {/* Verificación de stock usando item.stock */}
                        {hasStockWarning && (
                          <div className="text-xs text-amber-600 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span>Cantidad excede el stock disponible ({availableStock})</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="font-medium">
                          {/* Usa item.unitPrice */}
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </div>
                        <div className="flex items-center justify-end mt-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 rounded-full"
                            // Usa item.id
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="mx-2 text-sm min-w-[20px] text-center">{item.quantity}</span>

                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 rounded-full"
                            // Usa item.id
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            // Deshabilitar si es producto con stock definido y se alcanzó el límite
                            disabled={isStockLimited && item.quantity >= (availableStock ?? Infinity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
             })}
          </div>
        )}

        {/* Footer con totales (sin cambios) */}
        <div className="p-4 space-y-2 bg-gray-50 border-t">
          {/* ... subtotal, tax, total ... */}
           <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Impuesto (16%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-medium text-base py-2 border-t mt-1">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}