// src/app/(admin)/admin/pos/ventas/nueva/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Search, Tag, Plus, Minus } from "lucide-react";
import { getCurrentDrawer } from "@/app/actions/pos/cash-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/app/actions/pos/services";
import { getInventoryForSale } from "@/app/actions/pos/inventory";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateInventoryCategory } from "@/utils/pos-helpers";
import { formatCurrency } from "@/utils/pos-helpers";
import { InventoryCategory } from "@prisma/client";

export const metadata: Metadata = {
  title: "Nueva Venta | POS",
  description: "Crear una nueva venta en el sistema POS"
};

export const dynamic = "force-dynamic"; // Asegurarse de que la página se renderiza en cada solicitud

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    search?: string;
    tab?: string;
  };
}) {
  // Verificar que el usuario actual tiene permisos para usar el POS
  const { getRoles, isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }
  
  // Obtenemos los roles usando el mismo enfoque que en el componente principal del POS
  const roles = await getRoles();
  
  // Verificar permisos específicos del POS - usando Kinde roles
  const isAdmin = roles?.some((role) => role.key === "admin");
  const isCashier = roles?.some((role) => role.key === "cashier");
  
  // Si no tiene rol de admin o cajero, redirigir
  if (!isAdmin && !isCashier) {
    redirect("/admin");
  }
  
  // Verificar que hay una caja abierta antes de permitir ventas
  const currentDrawer = await getCurrentDrawer();
  
  if (!currentDrawer || currentDrawer.status !== "OPEN") {
    redirect("/admin/pos?error=drawer-closed");
  }
  
  // Obtener parámetros de búsqueda
  const category = searchParams.category as InventoryCategory | null;
  const search = searchParams.search || "";
  const activeTab = searchParams.tab || "products";
  
  // Obtener servicios activos para seleccionar
  const servicesResult = await getServices({ isActive: true });
  
  // Obtener productos del inventario
  const inventoryResult = await getInventoryForSale({ 
    category: category,
    searchTerm: search,
    limit: 12 
  });
  
  // Categorías de productos más comunes para mostrar como filtros rápidos
  const commonCategories: InventoryCategory[] = [
    "MEDICINE",
    "FOOD",
    "ACCESSORY",
    "VACCINE",
    "CONSUMABLE",
    "DRY_FOOD",
    "SUPPLEMENTS_OTHERS"
  ];
  
  return (
    <div className="container py-4 max-w-7xl">
      <div className="mb-4 flex justify-between items-center">
        <Link
          href="/admin/pos"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al POS
        </Link>
        
        <div className="flex items-center bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Caja abierta: {new Date(currentDrawer.openedAt).toLocaleString()}
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Nueva Venta</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Selección de productos y servicios */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
            </TabsList>
            
            {/* Contenido de la pestaña de Productos */}
            <TabsContent value="products" className="space-y-4">
              {/* Búsqueda y filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <form className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    name="search"
                    placeholder="Buscar productos..." 
                    className="pl-10"
                    defaultValue={search}
                  />
                  <input type="hidden" name="tab" value="products" />
                  <Button 
                    type="submit"
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              
              {/* Filtros por categoría */}
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/pos/ventas/nueva?tab=products">
                  <Badge 
                    variant={!category ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    Todos
                  </Badge>
                </Link>
                {commonCategories.map(cat => (
                  <Link key={cat} href={`/admin/pos/ventas/nueva?tab=products&category=${cat}`}>
                    <Badge 
                      variant={category === cat ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {translateInventoryCategory(cat)}
                    </Badge>
                  </Link>
                ))}
              </div>
              
              {/* Lista de productos */}
              {inventoryResult.products.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-gray-500">
                      <p>No se encontraron productos con los filtros actuales.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inventoryResult.products.map((product) => (
                    <Card key={product.id} className="overflow-hidden h-full">
                      <div className="p-4 flex flex-col h-full">
                        <div className="mb-1">
                          <Badge variant="outline" className="text-xs mb-1">
                            {translateInventoryCategory(product.category)}
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-base mb-1">{product.name}</h3>
                        
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-grow">
                          {product.description || "Sin descripción"}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-semibold text-green-600">
                              {formatCurrency(0.00)}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            {product.quantity <= 10 && (
                              <div className="text-xs text-amber-600 mr-2 flex items-center">
                                <span className="text-amber-600 mr-1">Stock:</span>
                                <span className="font-medium">{product.quantity}</span>
                              </div>
                            )}
                            
                            <Button size="sm" variant="outline">
                              <Plus className="h-3 w-3 mr-1" /> Agregar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Paginación */}
              {inventoryResult.pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-1">
                    {Array.from({ length: inventoryResult.pagination.pages }).map((_, i) => (
                      <Link
                        key={i}
                        href={`/admin/pos/ventas/nueva?tab=products&page=${i + 1}${
                          category ? `&category=${category}` : ''
                        }${
                          search ? `&search=${search}` : ''
                        }`}
                      >
                        <Button
                          variant={i + 1 === inventoryResult.pagination.page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {i + 1}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Contenido de la pestaña de Servicios */}
            <TabsContent value="services" className="space-y-4">
              {/* Búsqueda de servicios */}
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar servicios..." 
                  className="pl-10"
                />
              </div>
              
              {/* Lista de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicesResult.services.map((service) => (
                  <Card key={service.id} className="overflow-hidden h-full">
                    <div className="p-4 flex flex-col h-full">
                      <h3 className="font-medium text-base mb-1">{service.name}</h3>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2 flex-grow">
                        {service.description || "Sin descripción"}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-2 border-t">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                        
                        <Button size="sm" variant="outline" className="ml-auto">
                          <Plus className="h-3 w-3 mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Panel derecho - Resumen de la venta */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resumen de Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="justify-start text-left h-auto py-2">
                  <span className="text-gray-500 mr-2">Cliente (opcional):</span>
                  <span className="font-medium">Seleccionar cliente</span>
                </Button>
                
                <Button variant="outline" size="sm" className="justify-start text-left h-auto py-2">
                  <span className="text-gray-500 mr-2">Mascota (opcional):</span>
                  <span className="font-medium">Seleccionar mascota</span>
                </Button>
              </div>
              
              {/* Artículos en la venta */}
              <div className="border rounded-md">
                <div className="p-3 border-b bg-gray-50">
                  <h3 className="font-medium text-sm">Artículos en la venta</h3>
                </div>
                
                <div className="p-4 min-h-[150px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm italic">No hay artículos seleccionados</p>
                </div>
                
                {/* Ejemplo de artículo (oculto por ahora) */}
                <div className="hidden p-3 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">Consulta general</div>
                      <div className="text-sm text-gray-500">Servicio - Consulta</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(300)}</div>
                      <div className="flex items-center mt-1">
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full">
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 text-sm">1</span>
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resumen de totales */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Impuesto (16%):</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-base pt-2 border-t mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Método de pago */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="justify-center py-6">Efectivo</Button>
                <Button variant="outline" className="justify-center py-6">Tarjeta</Button>
                <Button variant="outline" className="justify-center py-6">Transferencia</Button>
                <Button variant="outline" className="justify-center py-6">Móvil</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Botones de acción */}
          <div className="flex flex-col gap-2">
            <Button size="lg" className="py-6" disabled={true}>
              Procesar Venta
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/pos">Cancelar</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}