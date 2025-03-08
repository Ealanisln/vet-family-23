// src/app/(admin)/admin/pos/page.tsx
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, DollarSign, ListChecks, Coffee } from "lucide-react";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";

export const metadata: Metadata = {
  title: "Sistema POS | Veterinaria",
  description: "Sistema de punto de venta para la clínica veterinaria"
};

export default async function POSPage() {
  // Verificar que el usuario actual tiene permisos para usar el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  // Obtener el estado actual de la caja
  const currentDrawer = await getCurrentDrawer();
  const isDrawerOpen = currentDrawer && currentDrawer.status === "OPEN";
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Sistema de Punto de Venta</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Caja */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-blue-600" />
              Caja
            </CardTitle>
            <CardDescription>Gestiona la apertura y cierre de caja</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isDrawerOpen ? (
              <div className="space-y-4">
                <div className="bg-green-100 p-3 rounded-md text-green-800 text-sm font-medium">
                  Caja actualmente abierta
                </div>
                <Button asChild className="w-full">
                  <Link href="/admin/pos/cierre-caja">Cerrar Caja</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-100 p-3 rounded-md text-yellow-800 text-sm font-medium">
                  No hay caja abierta actualmente
                </div>
                <Button asChild className="w-full">
                  <Link href="/admin/pos/apertura-caja">Abrir Caja</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tarjeta de Nueva Venta */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-6 w-6 text-green-600" />
              Nueva Venta
            </CardTitle>
            <CardDescription>Procesa una venta de productos o servicios</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              asChild 
              className="w-full"
              disabled={!isDrawerOpen}
            >
              <Link href="/admin/pos/ventas/nueva">
                Iniciar Nueva Venta
              </Link>
            </Button>
            {!isDrawerOpen && (
              <p className="text-red-500 text-sm mt-2">
                Debes abrir la caja antes de iniciar una venta
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Tarjeta de Historial de Ventas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <ListChecks className="mr-2 h-6 w-6 text-purple-600" />
              Historial de Ventas
            </CardTitle>
            <CardDescription>Consulta las ventas realizadas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/pos/ventas">Ver Historial de Ventas</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Tarjeta de Servicios */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center">
              <Coffee className="mr-2 h-6 w-6 text-amber-600" />
              Servicios
            </CardTitle>
            <CardDescription>Gestiona los servicios que ofrece la clínica</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/pos/servicios">Administrar Servicios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}