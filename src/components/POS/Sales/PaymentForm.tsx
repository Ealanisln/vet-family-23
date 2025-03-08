// src/components/POS/Sales/PaymentForm.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, DollarSign, Landmark, Smartphone, ChevronsRight } from "lucide-react";

interface PaymentFormProps {
  onSubmit: (data: { method: string }) => void;
  total: number;
  disabled?: boolean;
}

export default function PaymentForm({ onSubmit, total, disabled = false }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async () => {
    if (disabled || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onSubmit({ method: paymentMethod });
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Método de pago</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="CASH" id="cash" />
            <Label htmlFor="cash" className="flex items-center cursor-pointer">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Efectivo
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="CREDIT_CARD" id="credit" />
            <Label htmlFor="credit" className="flex items-center cursor-pointer">
              <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
              Tarjeta de crédito
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="DEBIT_CARD" id="debit" />
            <Label htmlFor="debit" className="flex items-center cursor-pointer">
              <CreditCard className="h-4 w-4 mr-2 text-purple-600" />
              Tarjeta de débito
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="TRANSFER" id="transfer" />
            <Label htmlFor="transfer" className="flex items-center cursor-pointer">
              <Landmark className="h-4 w-4 mr-2 text-indigo-600" />
              Transferencia bancaria
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50 cursor-pointer">
            <RadioGroupItem value="MOBILE_PAYMENT" id="mobile" />
            <Label htmlFor="mobile" className="flex items-center cursor-pointer">
              <Smartphone className="h-4 w-4 mr-2 text-orange-600" />
              Pago móvil
            </Label>
          </div>
        </RadioGroup>
        
        <Button
          className="w-full mt-4"
          size="lg"
          onClick={handleSubmit}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Procesar pago de ${total.toFixed(2)}
              <ChevronsRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}