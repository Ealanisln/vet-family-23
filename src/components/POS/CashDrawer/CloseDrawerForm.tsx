// src/components/POS/CashDrawer/CloseDrawerForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2, DollarSign, ArrowRight, Info } from "lucide-react";
import { getCurrentDrawer, closeCashDrawer } from "@/app/actions/pos/cash-drawer";
import { formatCurrency, calculateDrawerBalance } from "@/utils/pos-helpers";
import TransactionHistory from "./TransactionHistory";
import type { CashDrawer } from "@/types/pos";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

export default function CloseDrawerForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const [drawer, setDrawer] = useState<CashDrawer | null>(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const expectedAmount = drawer ? calculateDrawerBalance(drawer) : 0;
  const difference = finalAmount - expectedAmount;

  useEffect(() => {
    const fetchDrawer = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push('/api/auth/login');
        return;
      }

      try {
        const currentDrawer = await getCurrentDrawer();
        setDrawer(currentDrawer);

        if (currentDrawer) {
          setFinalAmount(calculateDrawerBalance(currentDrawer));
        }
      } catch (error) {
        console.error("Error al obtener la caja actual:", error);
        toast({
          title: "Error",
          description: "No se pudo obtener la información de la caja actual.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDrawer();
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drawer) {
      toast({
        title: "Error",
        description: "No hay caja abierta para cerrar.",
        variant: "destructive",
      });
      return;
    }

    if (finalAmount < 0) {
      toast({
        title: "Error",
        description: "El monto final no puede ser negativo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Intentando cerrar caja con datos:", { finalAmount, notes });

      const result = await closeCashDrawer({
        finalAmount,
        notes,
      });

      console.log("Resultado del cierre de caja:", result);

      if (result.success) {
        toast({
          title: "Caja cerrada",
          description: "La caja ha sido cerrada correctamente.",
        });

        // Limpiar estado local
        setDrawer(null);
        
        // Usar setTimeout para asegurar que todas las actualizaciones
        // de estado se hayan completado antes de navegar
        setTimeout(() => {
          try {
            // Intentar la navegación primero con replace para evitar historial
            window.location.replace('/admin/pos');
            
            // Como fallback, después de un tiempo verificamos si seguimos en la misma página
            setTimeout(() => {
              if (window.location.pathname.includes('/cierre-caja')) {
                console.log('Fallback navigation activated');
                window.location.href = '/admin/pos';
              }
            }, 300);
          } catch (e) {
            console.error('Navigation error:', e);
            // Si hay algún error, forzar la navegación
            window.location.href = '/admin/pos';
          }
        }, 300);
        
        return; // Importante: salir temprano para evitar actualizaciones de estado adicionales
      } else {
        throw new Error(result.error || "Error al cerrar la caja");
      }
    } catch (error) {
      console.error("Error detallado al cerrar la caja:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al cerrar la caja",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!drawer) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No hay caja abierta</CardTitle>
          <CardDescription>
            No hay ninguna caja abierta para cerrar en este momento.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => router.push("/admin/pos")}
            className="w-full"
          >
            Volver al POS
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cierre de Caja</CardTitle>
          <CardDescription>
            Registra el monto final y cierra la caja actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Monto inicial</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {formatCurrency(drawer.initialAmount)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monto esperado</Label>
                <div className="p-2 bg-gray-50 rounded border font-medium">
                  {formatCurrency(expectedAmount)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalAmount">Monto final (conteo real)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="finalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diferencia</Label>
                <div className={`p-2 rounded border font-medium ${
                  difference === 0 ? 'bg-green-50 text-green-600' :
                  difference > 0 ? 'bg-blue-50 text-blue-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {formatCurrency(difference)}
                  {difference !== 0 && (
                    <div className="text-xs font-normal mt-1 flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      {difference > 0
                        ? "Sobrante: Hay más dinero del esperado"
                        : "Faltante: Hay menos dinero del esperado"}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Añade notas o comentarios sobre el cierre de caja"
                  disabled={isSubmitting}
                  rows={3}
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
                    Cerrar Caja
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transacciones</CardTitle>
          <CardDescription>
            Transacciones realizadas durante esta sesión de caja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory transactions={drawer.transactions} />
        </CardContent>
      </Card>
    </div>
  );
}