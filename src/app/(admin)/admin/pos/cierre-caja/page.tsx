// src/app/(admin)/admin/pos/cierre-caja/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";
import CloseDrawerForm from "@/components/POS/CashDrawer/CloseDrawerForm";
import { userHasPOSPermission } from "@/utils/pos-helpers";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Cierre de Caja | POS",
  description: "Cierre de caja para el sistema POS"
};

export default async function CloseDrawerPage() {
  // Verificar que el usuario tiene permisos para el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  const hasPermission = await userHasPOSPermission(session.user?.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Verificar si hay una caja abierta
  const currentDrawer = await getCurrentDrawer();
  
  if (!currentDrawer) {
    // Si no hay una caja abierta, mostrar mensaje y opción para abrir una caja
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Cierre de Caja</h1>
        
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No hay caja abierta</AlertTitle>
          <AlertDescription>
            No hay ninguna caja abierta para cerrar en este momento.
          </AlertDescription>
        </Alert>
        
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/admin/pos">Volver al POS</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/pos/apertura-caja">Abrir Caja</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Cierre de Caja</h1>
      
      <CloseDrawerForm />
    </div>
  );
}