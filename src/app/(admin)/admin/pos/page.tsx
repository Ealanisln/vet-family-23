// src/app/(admin)/admin/pos/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, DollarSign, ListChecks, Coffee, Package } from "lucide-react";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";

export const metadata: Metadata = {
  title: "Sistema POS | Veterinaria",
  description: "Sistema de punto de venta para la clínica veterinaria"
};

export const dynamic = "force-dynamic";

export default async function POSPage() {
  // Obtenemos directamente los roles. El middleware ya validó la autenticación.
  const { getRoles } = getKindeServerSession();

  // Obtenemos los roles
  const roles = await getRoles();

  // Verificar permisos específicos del POS - usando Kinde roles
  const isAdmin = roles?.some((role) => role.key === "admin");
  // ¡IMPORTANTE! Asegúrate de que el rol 'cashier' exista en Kinde si planeas usarlo,

  // Si no tiene rol de admin o cajero, redirigir
  if (!isAdmin) {
     console.log(`POSPage: Redirecting to /admin due to role check. isAdmin: ${isAdmin}. Roles received:`, roles);
    return redirect("/admin");
  }
  
  // Obtener el estado actual de la caja
  let currentDrawer = null; // Initialize with null
  let drawerError = null; // Variable to store potential error
  try {
    currentDrawer = await getCurrentDrawer();
  } catch (error) {
    console.error("Error fetching current drawer state:", error);
    drawerError = error instanceof Error ? error.message : "Unknown error fetching drawer";
    // Decide how to handle the error - maybe show a message, or allow page load with drawer info missing
    // For now, we'll let the page load but indicate an error occurred.
  }
  
  // Use the potentially null currentDrawer safely
  const isDrawerOpen = currentDrawer && currentDrawer.status === "OPEN";
  
  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Sistema de Punto de Venta</h1>
          <p className="mt-2 text-gray-600">Gestiona tus ventas y servicios de manera eficiente</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Tarjeta de Caja */}
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500 flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center text-xl">
                <DollarSign className="mr-2 h-6 w-6 text-blue-600" />
                Caja
              </CardTitle>
              <CardDescription className="text-sm">Gestiona la apertura y cierre de caja</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col justify-end">
              {drawerError ? ( // Display error if fetching failed
                <div className="space-y-4">
                  <div className="bg-red-100 p-3 rounded-lg text-red-800 text-sm font-medium border border-red-200">
                    Error al obtener estado de caja: {drawerError}
                  </div>
                  {/* Optionally disable buttons or show different state */}
                   <Button disabled className="w-full shadow-sm h-10">Abrir Caja</Button>
                   <Button disabled className="w-full shadow-sm h-10">Cerrar Caja</Button>
                </div>
              ) : isDrawerOpen ? (
                <div className="space-y-4">
                  <div className="bg-green-100 p-3 rounded-lg text-green-800 text-sm font-medium border border-green-200">
                    Caja actualmente abierta
                  </div>
                  <Button asChild variant="destructive" className="w-full shadow-sm h-10">
                    <Link href="/admin/pos/cierre-caja">Cerrar Caja</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-100 p-3 rounded-lg text-yellow-800 text-sm font-medium border border-yellow-200">
                    No hay caja abierta actualmente
                  </div>
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm h-10">
                    <Link href="/admin/pos/apertura-caja">Abrir Caja</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tarjeta de Nueva Venta */}
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-green-500 flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center text-xl">
                <ShoppingBag className="mr-2 h-6 w-6 text-green-600" />
                Nueva Venta
              </CardTitle>
              <CardDescription className="text-sm">Procesa una venta de productos o servicios</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col justify-end">
              <Button 
                asChild 
                className={`w-full shadow-sm h-10 ${!isDrawerOpen || drawerError ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={!isDrawerOpen || !!drawerError} // Disable if drawer isn't open OR if there was an error
              >
                <Link href="/admin/pos/ventas/nueva">
                  Iniciar Nueva Venta
                </Link>
              </Button>
              {!isDrawerOpen && (
                <p className="text-red-500 text-sm mt-3 text-center">
                  Debes abrir la caja antes de iniciar una venta
                </p>
              )}
              {drawerError && ( // Show drawer error message here too
                 <p className="text-red-500 text-sm mt-3 text-center">
                   No se pudo verificar el estado de la caja.
                 </p>
              )}
            </CardContent>
          </Card>
          
          {/* Tarjeta de Historial de Ventas */}
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500 flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center text-xl">
                <ListChecks className="mr-2 h-6 w-6 text-purple-600" />
                Historial de Ventas
              </CardTitle>
              <CardDescription className="text-sm">Consulta las ventas realizadas</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col justify-end">
              <Button asChild variant="outline" className="w-full shadow-sm hover:bg-purple-50 h-10">
                <Link href="/admin/pos/ventas">Ver Historial de Ventas</Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Tarjeta de Servicios */}
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-amber-500 flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center text-xl">
                <Coffee className="mr-2 h-6 w-6 text-amber-600" />
                Servicios
              </CardTitle>
              <CardDescription className="text-sm">Gestiona los servicios que ofrece la clínica</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col justify-end">
              <Button asChild variant="outline" className="w-full shadow-sm hover:bg-amber-50 h-10">
                <Link href="/admin/pos/servicios">Administrar Servicios</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Nueva Tarjeta de Productos */}
          <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500 flex flex-col">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center text-xl">
                <Package className="mr-2 h-6 w-6 text-indigo-600" />
                Productos
              </CardTitle>
              <CardDescription className="text-sm">Gestiona los precios y costos de los productos</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-grow flex flex-col justify-end">
              <Button asChild variant="outline" className="w-full shadow-sm hover:bg-indigo-50 h-10">
                <Link href="/admin/pos/productos">Administrar Productos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}