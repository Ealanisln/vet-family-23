// src/app/(admin)/admin/pos/apertura-caja/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";
import OpenDrawerForm from "@/components/POS/CashDrawer/OpenDrawerForm";

export const metadata: Metadata = {
  title: "Apertura de Caja | POS",
  description: "Apertura de caja para el sistema POS"
};

export const dynamic = "force-dynamic";

export default async function OpenDrawerPage() {
  // Verificar que el usuario tiene permisos para el POS
  const { isAuthenticated, getRoles } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return redirect("/api/auth/login");
  }
  
  // Verificar roles mediante Kinde en lugar de la base de datos
  const roles = await getRoles();
  const isAdmin = roles?.some((role) => role.key === "admin");
  const isCashier = roles?.some((role) => role.key === "cashier");
  
  // Si no tiene rol de admin o cajero, redirigir
  if (!isAdmin && !isCashier) {
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