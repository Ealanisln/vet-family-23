// src/components/POS/PriceForm.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Loader2 } from "lucide-react";
import { calculateMargin } from "@/app/actions/pos/inventory-price";
import { toast } from "@/components/ui/use-toast";

interface PriceFormProps {
  productId: string;
  initialPrice: number | null;
  initialCost: number | null;
}

export function PriceForm({ productId, initialPrice, initialCost }: PriceFormProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState<string>(initialPrice?.toString() || '');
  const [cost, setCost] = useState<string>(initialCost?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const margin = calculateMargin(
    price ? parseFloat(price) : null,
    cost ? parseFloat(cost) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/pos/inventory/price', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          price: price ? parseFloat(price) : null,
          cost: cost ? parseFloat(cost) : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar los precios');
      }
      
      toast({
        title: "Precios actualizados",
        description: "Los precios del producto se han actualizado correctamente",
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los precios. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y punto decimal
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(value);
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y punto decimal
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCost(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Precios</DialogTitle>
          <DialogDescription>
            Actualice el precio y costo del producto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="cost"
                  value={cost}
                  onChange={handleCostChange}
                  placeholder="Ingrese el costo"
                  className="pl-6"
                />
              </div>
              <p className="text-xs text-gray-500">Precio de compra o fabricación</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="Ingrese el precio de venta"
                  className="pl-6"
                />
              </div>
              <p className="text-xs text-gray-500">Precio al que se venderá al cliente</p>
            </div>
            
            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium">Margen de Ganancia</div>
              <div className="text-2xl font-bold">
                {margin !== null ? `${margin}%` : '-'}
              </div>
              <p className="text-xs text-gray-500">
                Porcentaje de ganancia basado en el costo y precio de venta
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}