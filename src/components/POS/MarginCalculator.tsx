// src/components/POS/MarginCalculator.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { DollarSign, Percent, Calculator, RefreshCw } from "lucide-react";

type CalculationMode = 'margin' | 'markup';

export function MarginCalculator() {
  const [mode, setMode] = useState<CalculationMode>('margin');
  const [cost, setCost] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [marginPercent, setMarginPercent] = useState<string>('');
  const [calculationDirection, setCalculationDirection] = useState<'costToPrice' | 'priceToMargin'>('costToPrice');
  const [taxRate, setTaxRate] = useState<string>('16');
  const [includeTax, setIncludeTax] = useState<boolean>(false);
  
  // Cuando el usuario cambia el costo o el margen, calcular el precio de venta
  useEffect(() => {
    if (calculationDirection === 'costToPrice' && cost && marginPercent) {
      const costValue = parseFloat(cost);
      const marginValue = parseFloat(marginPercent);
      
      let calculatedPrice: number;
      
      if (mode === 'margin') {
        // Fórmula de margen: precio = costo / (1 - margen/100)
        calculatedPrice = costValue / (1 - marginValue / 100);
      } else {
        // Fórmula de markup: precio = costo * (1 + markup/100)
        calculatedPrice = costValue * (1 + marginValue / 100);
      }
      
      // Añadir impuestos si se seleccionó
      if (includeTax && taxRate) {
        calculatedPrice = calculatedPrice * (1 + parseFloat(taxRate) / 100);
      }
      
      setPrice(calculatedPrice.toFixed(2));
    }
  }, [cost, marginPercent, mode, calculationDirection, includeTax, taxRate]);
  
  // Cuando el usuario cambia el costo o el precio, calcular el margen
  useEffect(() => {
    if (calculationDirection === 'priceToMargin' && cost && price) {
      const costValue = parseFloat(cost);
      let priceValue = parseFloat(price);
      
      // Quitar impuestos si se seleccionó
      if (includeTax && taxRate) {
        priceValue = priceValue / (1 + parseFloat(taxRate) / 100);
      }
      
      let calculatedMargin: number;
      
      if (mode === 'margin') {
        // Fórmula de margen: margen = (precio - costo) / precio * 100
        calculatedMargin = ((priceValue - costValue) / priceValue) * 100;
      } else {
        // Fórmula de markup: markup = (precio - costo) / costo * 100
        calculatedMargin = ((priceValue - costValue) / costValue) * 100;
      }
      
      setMarginPercent(calculatedMargin.toFixed(2));
    }
  }, [cost, price, mode, calculationDirection, includeTax, taxRate]);
  
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCost(value);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPrice(value);
    setCalculationDirection('priceToMargin');
  };
  
  const handleMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setMarginPercent(value);
    setCalculationDirection('costToPrice');
  };
  
  const handleMarginSliderChange = (value: number[]) => {
    setMarginPercent(value[0].toString());
    setCalculationDirection('costToPrice');
  };
  
  const handleReset = () => {
    setCost('');
    setPrice('');
    setMarginPercent('');
    setCalculationDirection('costToPrice');
  };
  
  // Calcular valores para la tabla de referencia
  const generateReferenceTable = () => {
    if (!cost) return [];
    
    const costValue = parseFloat(cost);
    const margins = [10, 20, 30, 40, 50, 60];
    
    return margins.map(margin => {
      let calculatedPrice: number;
      
      if (mode === 'margin') {
        calculatedPrice = costValue / (1 - margin / 100);
      } else {
        calculatedPrice = costValue * (1 + margin / 100);
      }
      
      // Añadir impuestos si se seleccionó
      if (includeTax && taxRate) {
        calculatedPrice = calculatedPrice * (1 + parseFloat(taxRate) / 100);
      }
      
      return {
        margin,
        price: calculatedPrice.toFixed(2),
      };
    });
  };
  
  const referenceTable = generateReferenceTable();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calculadora de Márgenes y Precios</CardTitle>
          <CardDescription>
            Calcule precios basados en costos y márgenes deseados, o viceversa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="space-y-6">
            <TabsList>
              <TabsTrigger value="calculator">Calculadora</TabsTrigger>
              <TabsTrigger value="reference">Tabla de Referencia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Modo de Cálculo</Label>
                    <RadioGroup 
                      className="flex space-x-4" 
                      value={mode} 
                      onValueChange={(value) => setMode(value as CalculationMode)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="margin" id="calc-mode-margin" />
                        <Label htmlFor="calc-mode-margin">Margen</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="markup" id="calc-mode-markup" />
                        <Label htmlFor="calc-mode-markup">Markup</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-500">
                      {mode === 'margin' 
                        ? 'Margen: (Precio - Costo) / Precio × 100' 
                        : 'Markup: (Precio - Costo) / Costo × 100'}
                    </p>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                      </span>
                      <Input
                        id="cost"
                        value={cost}
                        onChange={handleCostChange}
                        placeholder="Ingrese el costo del producto"
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Costo del producto sin incluir impuestos
                    </p>
                  </div>
                  
                  {calculationDirection === 'costToPrice' ? (
                    <div className="space-y-2">
                      <Label htmlFor="margin">
                        {mode === 'margin' ? 'Margen Deseado' : 'Markup Deseado'}
                      </Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <Percent className="h-4 w-4" />
                        </span>
                        <Input
                          id="margin"
                          value={marginPercent}
                          onChange={handleMarginChange}
                          placeholder={`Ingrese el ${mode === 'margin' ? 'margen' : 'markup'} deseado`}
                          className="pl-9"
                        />
                      </div>
                      <Slider
                        value={marginPercent ? [parseFloat(marginPercent)] : [0]}
                        min={0}
                        max={95}
                        step={1}
                        onValueChange={handleMarginSliderChange}
                        className="py-4"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio de Venta</Label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <DollarSign className="h-4 w-4" />
                        </span>
                        <Input
                          id="price"
                          value={price}
                          onChange={handlePriceChange}
                          placeholder="Ingrese el precio de venta"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxes">Impuestos</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="include-tax"
                          checked={includeTax}
                          onChange={(e) => setIncludeTax(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="include-tax" className="text-sm">Incluir IVA</Label>
                      </div>
                      
                      {includeTax && (
                        <div className="flex-1">
                          <Select value={taxRate} onValueChange={setTaxRate}>
                            <SelectTrigger id="tax-rate">
                              <SelectValue placeholder="Tasa de IVA" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="16">16%</SelectItem>
                              <SelectItem value="8">8%</SelectItem>
                              <SelectItem value="0">0%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setCalculationDirection(calculationDirection === 'costToPrice' ? 'priceToMargin' : 'costToPrice')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cambiar modo de cálculo
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full"
                    onClick={handleReset}
                  >
                    Limpiar valores
                  </Button>
                </div>
                
                <div className="p-6 border rounded-lg bg-gray-50 space-y-4">
                  <div className="text-lg font-medium">Resultados</div>
                  
                  {cost ? (
                    calculationDirection === 'costToPrice' && marginPercent ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Costo:</span>
                          <span className="font-medium">${parseFloat(cost).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">
                            {mode === 'margin' ? 'Margen:' : 'Markup:'}
                          </span>
                          <span className="font-medium">{marginPercent}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">
                            {includeTax ? "Precio con IVA:" : "Precio sin IVA:"}
                          </span>
                          <span className="text-xl font-bold text-green-600">
                            ${price}
                          </span>
                        </div>
                        {includeTax && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Precio sin IVA:</span>
                            <span className="font-medium">
                              ${(parseFloat(price) / (1 + parseFloat(taxRate) / 100)).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : calculationDirection === 'priceToMargin' && price ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Costo:</span>
                          <span className="font-medium">${parseFloat(cost).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">
                            {includeTax ? "Precio con IVA:" : "Precio sin IVA:"}
                          </span>
                          <span className="font-medium">${price}</span>
                        </div>
                        {includeTax && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Precio sin IVA:</span>
                            <span className="font-medium">
                              ${(parseFloat(price) / (1 + parseFloat(taxRate) / 100)).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">
                            {mode === 'margin' ? 'Margen:' : 'Markup:'}
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {marginPercent}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        Ingrese el costo y {mode === 'margin' ? 'margen' : 'markup'} para calcular el precio
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      Ingrese el costo para comenzar los cálculos
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reference" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reference-cost">Costo de Referencia</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="reference-cost"
                      value={cost}
                      onChange={handleCostChange}
                      placeholder="Ingrese el costo de referencia"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Costo base para generar la tabla de precios
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="include-tax-ref"
                        checked={includeTax}
                        onChange={(e) => setIncludeTax(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="include-tax-ref" className="text-sm">Incluir IVA</Label>
                    </div>
                    
                    {includeTax && (
                      <div className="flex-1 w-32">
                        <Select value={taxRate} onValueChange={setTaxRate}>
                          <SelectTrigger id="tax-rate-ref">
                            <SelectValue placeholder="Tasa de IVA" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16">16%</SelectItem>
                            <SelectItem value="8">8%</SelectItem>
                            <SelectItem value="0">0%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                
                {cost ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">
                            {mode === 'margin' ? 'Margen' : 'Markup'}
                          </th>
                          <th className="text-right py-2">Precio</th>
                          <th className="text-right py-2">Ganancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referenceTable.map((row) => (
                          <tr key={row.margin} className="border-b">
                            <td className="py-2">{row.margin}%</td>
                            <td className="text-right py-2">${row.price}</td>
                            <td className="text-right py-2">
                              ${(parseFloat(row.price) - parseFloat(cost)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    Ingrese un costo para generar la tabla de referencia
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}