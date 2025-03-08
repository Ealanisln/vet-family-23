// src/app/(admin)/admin/pos/apertura-caja/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";
import OpenDrawerForm from "@/components/POS/CashDrawer/OpenDrawerForm";
import { userHasPOSPermission } from "@/utils/pos-helpers";

export const metadata: Metadata = {
  title: "Apertura de Caja | POS",
  description: "Apertura de caja para el sistema POS"
};

export default async function OpenDrawerPage() {
  // Verificar que el usuario tiene permisos para el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  const hasPermission = await userHasPOSPermission(session.user?.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Verificar si ya hay una caja abierta
  const currentDrawer = await getCurrentDrawer();
  
  if (currentDrawer) {
    // Si ya hay una caja abierta, redirigir al POS
    return redirect("/admin/pos");
  }
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Apertura de Caja</h1>
      
      <OpenDrawerForm />
    </div>
  );
}