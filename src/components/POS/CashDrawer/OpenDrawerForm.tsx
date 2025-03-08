// src/components/POS/CashDrawer/OpenDrawerForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, DollarSign, ArrowRight } from "lucide-react";
import { openCashDrawer } from "@/app/actions/pos/cash-drawer";

export default function OpenDrawerForm() {
  const router = useRouter();
  const [initialAmount, setInitialAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialAmount <= 0) {
      toast({
        title: "Error",
        description: "El monto inicial debe ser mayor a cero.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await openCashDrawer(initialAmount);
      
      if (result.success) {
        toast({
          title: "Caja abierta",
          description: "La caja ha sido abierta correctamente.",
        });
        
        router.push("/admin/pos");
      } else {
        throw new Error(result.error || "Error al abrir la caja");
      }
    } catch (error) {
      console.error("Error al abrir la caja:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al abrir la caja",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Apertura de Caja</CardTitle>
        <CardDescription>
          Registra el monto inicial con el que comienza la caja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Monto inicial</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="initialAmount"
                type="number"
                min="0"
                step="0.01"
                className="pl-10"
                value={initialAmount}
                onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/pos")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Abrir Caja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}