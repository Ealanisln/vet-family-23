// src/components/POS/Sales/Cart.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingCart, Minus, Plus } from "lucide-react"; // Importar Minus y Plus
import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/types/pos";
import { formatCurrency } from "@/utils/pos-helpers"; // Importar helper de formato

// --- INTERFAZ DE PROPS ACTUALIZADA ---
// Ahora usan itemId en lugar de index
interface CartProps {
  items: CartItem[];
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
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
      {/* Eliminado overflow-y-auto y max-h aquí, considera ponerlo en un contenedor padre si es necesario */}
      <div className="divide-y">
        {items.map((item) => {
          // Determinar si se debe deshabilitar el botón + (si es producto y se conoce el stock)
          const isProductWithStock = item.type === 'product' && typeof item.stock === 'number';
          const disablePlus = isProductWithStock && item.quantity >= (item.stock ?? Infinity);

          return (
            // --- KEY ACTUALIZADA ---
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant={item.type === 'product' ? 'default' : 'secondary'} className="text-xs">
                      {item.type === 'product' ? 'Producto' : 'Servicio'}
                    </Badge>
                  </div>
                  {/* Mostrar descripción solo si existe */}
                  {item.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{item.description}</p>
                  )}
                   {/* Mostrar categoría y compuesto activo si existen */}
                   {(item.category || item.activeCompound) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.category}
                        {item.category && item.activeCompound && ' - '}
                        {item.activeCompound}
                      </p>
                   )}

                  <div className="flex items-center mt-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      // --- USA item.id ---
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      // --- DESHABILITAR BOTÓN ---
                      disabled={item.quantity <= 1}
                      aria-label="Reducir cantidad" // Añadir aria-label por accesibilidad
                    >
                      {/* Usar Icono */}
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                       // Añadir max si hay stock
                      max={isProductWithStock ? item.stock : undefined}
                      value={item.quantity}
                      // --- USA item.id ---
                      // Asegurarse que la cantidad no exceda el stock al escribir directamente
                      onChange={(e) => {
                         let newQuantity = parseInt(e.target.value) || 1;
                         if (isProductWithStock && newQuantity > (item.stock ?? Infinity)) {
                             newQuantity = item.stock!; // Limitar al stock máximo
                         }
                         if (newQuantity < 1) {
                             newQuantity = 1; // Asegurar mínimo 1
                         }
                         updateQuantity(item.id, newQuantity);
                      }}
                      className="h-7 w-12 text-center mx-1 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" // Ocultar spinners de number input
                      aria-label={`Cantidad de ${item.name}`} // Mejor accesibilidad
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      // --- USA item.id ---
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      // --- DESHABILITAR BOTÓN ---
                      disabled={disablePlus}
                       aria-label="Aumentar cantidad" // Añadir aria-label
                    >
                      {/* Usar Icono */}
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  {/* --- USA formatCurrency --- */}
                  <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  <span className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} c/u</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 mt-1"
                    // --- USA item.id ---
                    onClick={() => removeItem(item.id)}
                     aria-label={`Eliminar ${item.name}`} // Añadir aria-label
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}