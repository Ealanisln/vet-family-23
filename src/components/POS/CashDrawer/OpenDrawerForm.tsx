// src/components/POS/CashDrawer/OpenDrawerForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, ArrowRight } from "lucide-react";
import { openCashDrawer } from "@/app/actions/pos/cash-drawer";

export default function OpenDrawerForm() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await openCashDrawer(formData);
    setIsSubmitting(false);
    if (result.success) {
      router.push('/admin/pos');
    } else {
      setError(result.error || "Ocurrió un error al abrir la caja");
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Apertura de Caja</CardTitle>
        <CardDescription>
          Registra el monto inicial con el que comienza la caja
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded-md px-4 py-2 mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isSubmitting}
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
              className="flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
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