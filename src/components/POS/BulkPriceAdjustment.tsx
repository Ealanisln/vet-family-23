// src/components/POS/BulkPriceAdjustment.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Percent, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { translateInventoryCategory } from "@/utils/pos-helpers";
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

interface BulkPriceAdjustmentProps {
  categories: (typeof InventoryCategory[keyof typeof InventoryCategory])[];
}

type AdjustmentType = 'percent' | 'fixed';
type PriceComponent = 'price' | 'cost' | 'both';
type AdjustmentDirection = 'increase' | 'decrease';

export function BulkPriceAdjustment({ categories }: BulkPriceAdjustmentProps) {
  const [category, setCategory] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percent');
  const [priceComponent, setPriceComponent] = useState<PriceComponent>('price');
  const [adjustmentDirection, setAdjustmentDirection] = useState<AdjustmentDirection>('increase');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{
    affectedProducts: number;
    averageBeforeAdjustment: number;
    averageAfterAdjustment: number;
  } | null>(null);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y punto decimal
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAdjustmentValue(value);
  };

  const generatePreview = async () => {
    if (!category || !adjustmentValue) {
      toast({
        title: "Datos incompletos",
        description: "Seleccione una categoría y proporcione un valor de ajuste",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/pos/inventory/price/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          adjustmentType,
          priceComponent,
          adjustmentDirection,
          adjustmentValue: parseFloat(adjustmentValue),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al generar la vista previa');
      }
      
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la vista previa. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyAdjustment = async () => {
    if (!category || !adjustmentValue) {
      toast({
        title: "Datos incompletos",
        description: "Seleccione una categoría y proporcione un valor de ajuste",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/pos/inventory/price/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          adjustmentType,
          priceComponent,
          adjustmentDirection,
          adjustmentValue: parseFloat(adjustmentValue),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al aplicar el ajuste');
      }
      
      const data = await response.json();
      toast({
        title: "Ajuste aplicado",
        description: `Se actualizaron los precios de ${data.updatedCount} productos.`,
      });
      
      // Resetear estado
      setPreview(null);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudo aplicar el ajuste. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ajuste Masivo de Precios</CardTitle>
          <CardDescription>
            Aplicar cambios de precios o costos a grupos de productos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría de Productos</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {translateInventoryCategory(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Componente a Ajustar</Label>
            <RadioGroup value={priceComponent} onValueChange={(value) => setPriceComponent(value as PriceComponent)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price" id="r1" />
                <Label htmlFor="r1">Solo Precio de Venta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cost" id="r2" />
                <Label htmlFor="r2">Solo Costo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="r3" />
                <Label htmlFor="r3">Ambos (Precio y Costo)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Tipo de Ajuste</Label>
            <RadioGroup value={adjustmentType} onValueChange={(value) => setAdjustmentType(value as AdjustmentType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percent" id="r4" />
                <Label htmlFor="r4">Porcentaje (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="r5" />
                <Label htmlFor="r5">Monto Fijo ($)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Dirección del Ajuste</Label>
            <RadioGroup value={adjustmentDirection} onValueChange={(value) => setAdjustmentDirection(value as AdjustmentDirection)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="increase" id="r6" />
                <Label htmlFor="r6">Incrementar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="decrease" id="r7" />
                <Label htmlFor="r7">Reducir</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adjustmentValue">Valor del Ajuste</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                {adjustmentType === 'percent' ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
              </span>
              <Input
                id="adjustmentValue"
                value={adjustmentValue}
                onChange={handleValueChange}
                placeholder={`Ingrese el ${adjustmentType === 'percent' ? 'porcentaje' : 'monto'}`}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={generatePreview}
            disabled={isLoading || !category || !adjustmentValue}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              'Vista Previa'
            )}
          </Button>
          <Button 
            type="button"
            onClick={applyAdjustment}
            disabled={isLoading || !category || !adjustmentValue}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aplicando...
              </>
            ) : (
              'Aplicar Ajuste'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Ajuste</CardTitle>
          <CardDescription>
            Resumen de los cambios antes de aplicarlos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!preview && !isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-gray-300" />
              <p className="text-gray-500">
                Haga clic en &quot;Vista Previa&quot; para visualizar el impacto de los ajustes antes de aplicarlos.
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="text-gray-500">
                Calculando ajustes...
              </p>
            </div>
          )}
          
          {preview && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Información Importante</AlertTitle>
                <AlertDescription>
                  Esta operación afectará a {preview.affectedProducts} productos de la categoría seleccionada.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">
                    {priceComponent === 'price' 
                      ? 'Precio promedio actual' 
                      : priceComponent === 'cost' 
                        ? 'Costo promedio actual' 
                        : 'Valor promedio actual'}
                  </Label>
                  <div className="text-2xl font-bold">
                    ${preview.averageBeforeAdjustment.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">
                    {priceComponent === 'price' 
                      ? 'Precio promedio después del ajuste' 
                      : priceComponent === 'cost' 
                        ? 'Costo promedio después del ajuste' 
                        : 'Valor promedio después del ajuste'}
                  </Label>
                  <div className="text-2xl font-bold text-green-600">
                    ${preview.averageAfterAdjustment.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-gray-500">Cambio porcentual</Label>
                  <div className="text-xl font-semibold">
                    {((preview.averageAfterAdjustment - preview.averageBeforeAdjustment) / 
                      preview.averageBeforeAdjustment * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}