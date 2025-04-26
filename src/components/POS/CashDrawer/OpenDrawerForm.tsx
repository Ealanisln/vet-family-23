"use client";
// src/components/POS/CashDrawer/OpenDrawerForm.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, ArrowRight } from "lucide-react";
import { openCashDrawer, type OpenDrawerState } from "@/app/actions/pos/cash-drawer";
import { useFormState } from "react-dom";

// Define initial state conforming to OpenDrawerState
const initialState: OpenDrawerState = {
  success: undefined,
  error: null,
  drawer: null,
  statusCode: null,
};

export default function OpenDrawerForm() {
  // useFormState para manejar errores y mensajes
  const [state, formAction] = useFormState(openCashDrawer, initialState);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Apertura de Caja</CardTitle>
        <CardDescription>
          Registra el monto inicial con el que comienza la caja
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-md px-4 py-2 mb-4 text-sm">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initialAmount">Monto inicial</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                id="initialAmount"
                name="initialAmount"
                type="number"
                min="0"
                step="0.01"
                className="pl-10"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              className="flex items-center"
            >
              Abrir Caja
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}