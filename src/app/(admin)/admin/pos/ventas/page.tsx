// src/app/(admin)/admin/pos/ventas/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getSales } from "@/app/actions/pos/sales";
import SalesTable from "@/components/POS/Sales/SalesTable";
import { userHasPOSPermission } from "@/utils/pos-helpers";

export const metadata: Metadata = {
  title: "Ventas | POS",
  description: "Historial de ventas del sistema POS"
};

interface SalesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  // Verificar que el usuario tiene permisos para el POS
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return redirect("/api/auth/login");
  }
  
  const user = await getUser();
  
  const hasPermission = await userHasPOSPermission(user.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Obtener parámetros de búsqueda y paginación
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "10");
  
  // Definir interfaz para los filtros
  interface SalesFilters {
    search?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
  }

  // Construir filtros
  const filters: SalesFilters = {};
  
  if (searchParams.search) {
    filters.search = searchParams.search;
  }
  
  if (searchParams.status && searchParams.status !== "ALL") {
    filters.status = searchParams.status;
  }
  
  if (searchParams.paymentMethod && searchParams.paymentMethod !== "ALL") {
    filters.paymentMethod = searchParams.paymentMethod;
  }
  
  if (searchParams.startDate) {
    filters.startDate = new Date(searchParams.startDate);
  }
  
  if (searchParams.endDate) {
    const endDate = new Date(searchParams.endDate);
    // Ajustar la fecha final para incluir todo el día
    endDate.setHours(23, 59, 59, 999);
    filters.endDate = endDate;
  }
  
  // Obtener las ventas
  const { sales, pagination } = await getSales({
    page,
    limit,
    ...filters
  });
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Historial de Ventas</h1>
      
      <SalesTable 
        sales={sales}
        pagination={pagination}
      />
    </div>
  );
}