// src/app/(admin)/admin/pos/ventas/nueva/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  User,
  CreditCard,
  Wallet,
  BanknoteIcon,
  PawPrint,
  ChevronRight,
  ChevronLeft,
  Tag,
} from "lucide-react";
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
  description: "Crear una nueva venta en el sistema POS",
};

export const dynamic = "force-dynamic";

// Type definitions
type SearchParams = {
  category?: string;
  search?: string;
  tab?: string;
  page?: string;
};

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Auth & permissions check
  const { getRoles, isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const roles = await getRoles();
  const isAdmin = roles?.some((role) => role.key === "admin");
  const isCashier = roles?.some((role) => role.key === "cashier");

  if (!isAdmin && !isCashier) {
    redirect("/admin");
  }

  // Cash drawer check
  const currentDrawer = await getCurrentDrawer();

  if (!currentDrawer || currentDrawer.status !== "OPEN") {
    redirect("/admin/pos?error=drawer-closed");
  }

  // Parse search parameters
  const category = searchParams.category as InventoryCategory | undefined;
  const search = searchParams.search || "";
  const activeTab = searchParams.tab || "products";
  const currentPage = parseInt(searchParams.page || "1");

  // Fetch data
  const servicesResult = await getServices({ isActive: true });
  const inventoryResult = await getInventoryForSale({
    category: category,
    searchTerm: search,
    page: currentPage,
    limit: 8,
  });

  // Common categories for filters
  const commonCategories: InventoryCategory[] = [
    "MEDICINE",
    "FOOD",
    "ACCESSORY",
    "VACCINE",
    "CONSUMABLE",
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with navigation */}
      <div className="bg-white shadow">
        <div className="container mx-auto py-6 px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link
                href="/admin/pos"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-3xl font-semibold text-gray-800">
                Nueva Venta
              </h1>
            </div>

            <div className="flex items-center gap-2 text-base font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
              <span>Caja abierta</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel - Product/Service selection */}
          <div className="lg:col-span-2">
            <Tabs defaultValue={activeTab} className="w-full">
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <TabsList className="w-full grid grid-cols-2 mb-6 bg-white border rounded-lg p-1 shadow-sm">
                  <TabsTrigger
                    value="products"
                    className="py-3 text-base font-medium transition-all data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
                  >
                    Productos
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="py-3 text-base font-medium transition-all data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
                  >
                    Servicios
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Products Tab */}
              <TabsContent value="products">
                <div className="bg-white rounded-lg shadow p-6 space-y-8">
                  {/* Search and filters */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <form className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="search"
                        placeholder="Buscar productos..."
                        className="pl-12 py-6 text-base bg-white border-gray-200 focus:border-blue-300 rounded-lg"
                        defaultValue={search}
                      />
                      <input type="hidden" name="tab" value="products" />
                    </form>
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-3 mb-2">
                    <Link href="/admin/pos/ventas/nueva?tab=products">
                      <Badge
                        variant={!category ? "default" : "outline"}
                        className={`cursor-pointer hover:opacity-90 transition-opacity text-base py-2 px-4 ${
                          !category
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Todos
                      </Badge>
                    </Link>
                    {commonCategories.map((cat) => (
                      <Link
                        key={cat}
                        href={`/admin/pos/ventas/nueva?tab=products&category=${cat}`}
                      >
                        <Badge
                          variant={category === cat ? "default" : "outline"}
                          className={`cursor-pointer transition-all text-base py-2 px-4 ${
                            category === cat
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {translateInventoryCategory(cat)}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  {/* Products grid */}
                  {inventoryResult.products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50 rounded-lg mt-8">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg text-gray-500">
                        No se encontraron productos
                      </p>
                      <p className="text-gray-400 mt-2">
                        Intenta con otra búsqueda o categoría
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                      {inventoryResult.products.map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                        >
                          <div className="p-5 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <Badge
                                variant="outline"
                                className="text-sm bg-gray-50 text-gray-600 px-3 py-1"
                              >
                                <Tag className="h-3.5 w-3.5 mr-1.5" />
                                {translateInventoryCategory(product.category)}
                              </Badge>

                              {/* Improved stock badge */}
                              {product.quantity <= 10 && (
                                <Badge
                                  variant="outline"
                                  className={`text-sm px-3 py-1 ${
                                    product.quantity <= 5
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  Stock: {product.quantity}
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-medium text-lg line-clamp-1 text-gray-800 mb-1">
                              {product.name}
                            </h3>

                            {/* Added max-h-12 to control description height */}
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 max-h-12">
                              {product.description || "Sin descripción"}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t">
                              <span className="font-semibold text-lg text-emerald-600">
                                {formatCurrency(product.price || 0)}
                              </span>

                              <Button className="gap-2 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none text-sm font-medium">
                                <Plus className="h-4 w-4" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {inventoryResult.pagination.pages > 1 && (
                    <div className="flex justify-center mt-8">
                      <nav className="flex items-center space-x-1">
                        {/* Previous page button */}
                        <Link
                          href={`/admin/pos/ventas/nueva?tab=products&page=${Math.max(
                            1,
                            inventoryResult.pagination.page - 1
                          )}${category ? `&category=${category}` : ""}${
                            search ? `&search=${search}` : ""
                          }`}
                          className={`p-2 rounded-md ${
                            inventoryResult.pagination.page <= 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          aria-disabled={inventoryResult.pagination.page <= 1}
                        >
                          <span className="sr-only">Página anterior</span>
                          <ChevronLeft className="h-5 w-5" />
                        </Link>

                        {/* Page numbers */}
                        {Array.from({
                          length: inventoryResult.pagination.pages,
                        }).map((_, i) => {
                          // Show first page, last page, current page, and pages around current page
                          const pageNum = i + 1;
                          const isCurrentPage =
                            pageNum === inventoryResult.pagination.page;
                          const isFirstPage = pageNum === 1;
                          const isLastPage =
                            pageNum === inventoryResult.pagination.pages;
                          const isNearCurrentPage =
                            Math.abs(
                              pageNum - inventoryResult.pagination.page
                            ) <= 1;

                          // Only display certain pages to avoid overcrowding
                          if (
                            !isFirstPage &&
                            !isLastPage &&
                            !isNearCurrentPage
                          ) {
                            // Add ellipsis for skipped pages, but only once per gap
                            if (
                              pageNum === 2 ||
                              pageNum === inventoryResult.pagination.pages - 1
                            ) {
                              return (
                                <span
                                  key={`ellipsis-${pageNum}`}
                                  className="px-2 text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <Link
                              key={pageNum}
                              href={`/admin/pos/ventas/nueva?tab=products&page=${pageNum}${
                                category ? `&category=${category}` : ""
                              }${search ? `&search=${search}` : ""}`}
                            >
                              <Button
                                variant={isCurrentPage ? "default" : "outline"}
                                size="icon"
                                className={`w-10 h-10 rounded-md ${
                                  isCurrentPage
                                    ? "bg-blue-500 text-white hover:bg-blue-600 font-medium"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-200"
                                }`}
                                aria-current={
                                  isCurrentPage ? "page" : undefined
                                }
                              >
                                {pageNum}
                              </Button>
                            </Link>
                          );
                        })}

                        {/* Next page button */}
                        <Link
                          href={`/admin/pos/ventas/nueva?tab=products&page=${Math.min(
                            inventoryResult.pagination.pages,
                            inventoryResult.pagination.page + 1
                          )}${category ? `&category=${category}` : ""}${
                            search ? `&search=${search}` : ""
                          }`}
                          className={`p-2 rounded-md ${
                            inventoryResult.pagination.page >=
                            inventoryResult.pagination.pages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          aria-disabled={
                            inventoryResult.pagination.page >=
                            inventoryResult.pagination.pages
                          }
                        >
                          <span className="sr-only">Página siguiente</span>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </nav>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="relative max-w-md mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar servicios..."
                      className="pl-12 py-6 text-base bg-white border-gray-200 focus:border-blue-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {servicesResult.services.map((service) => (
                      <Card
                        key={service.id}
                        className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="p-5 flex flex-col h-full">
                          <h3 className="font-medium text-lg mb-2 text-gray-800">
                            {service.name}
                          </h3>

                          <p className="text-base text-gray-500 line-clamp-2 mb-4">
                            {service.description || "Sin descripción"}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t">
                            <span className="font-semibold text-lg text-emerald-600">
                              {formatCurrency(service.price)}
                            </span>

                            <Button className="gap-2 py-2 px-4 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none text-base">
                              <Plus className="h-4 w-4" />
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right panel - Sale summary */}
          <div className="space-y-8">
            {/* Client and Pet selection */}
            <Card className="border-0 shadow rounded-lg overflow-hidden bg-white">
              <CardHeader className="pb-3 px-6 pt-5 border-b bg-gray-50">
                <CardTitle className="text-base font-medium text-gray-700">
                  Información de venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 h-auto py-4 px-6 hover:bg-blue-50 rounded-none border-b"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <span className="text-base text-gray-700">Cliente</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span className="text-base">Seleccionar</span>
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 h-auto py-4 px-6 hover:bg-blue-50 rounded-none"
                >
                  <div className="flex items-center gap-3">
                    <PawPrint className="h-5 w-5 text-blue-500" />
                    <span className="text-base text-gray-700">Mascota</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <span className="text-base">Seleccionar</span>
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Cart items */}
            <Card className="border-0 shadow rounded-lg overflow-hidden bg-white">
              <CardHeader className="pb-3 px-6 pt-5 border-b bg-gray-50">
                <CardTitle className="text-base font-medium text-gray-700">
                  Artículos en la venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="min-h-[250px] flex flex-col items-center justify-center p-8">
                  <ShoppingCart className="h-16 w-16 text-gray-200 mb-4" />
                  <p className="text-gray-400 text-base">
                    No hay artículos seleccionados
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Agrega productos o servicios desde el panel izquierdo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sale totals */}
            <Card className="border-0 shadow rounded-lg overflow-hidden bg-white">
              <CardHeader className="pb-3 px-6 pt-5 border-b bg-gray-50">
                <CardTitle className="text-base font-medium text-gray-700">
                  Resumen de venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between text-base py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-base py-2">
                  <span className="text-gray-600">Impuesto (16%):</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-base py-2">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg py-4 mt-2 border-t">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatCurrency(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment methods */}
            <Card className="border-0 shadow rounded-lg overflow-hidden bg-white">
              <CardHeader className="pb-3 px-6 pt-5 border-b bg-gray-50">
                <CardTitle className="text-base font-medium text-gray-700">
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-8 hover:bg-blue-50 hover:border-blue-300 gap-3 transition-colors rounded-lg"
                  >
                    <BanknoteIcon className="h-8 w-8 text-green-500" />
                    <span className="text-base">Efectivo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-8 hover:bg-blue-50 hover:border-blue-300 gap-3 transition-colors rounded-lg"
                  >
                    <CreditCard className="h-8 w-8 text-blue-500" />
                    <span className="text-base">Tarjeta</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-8 hover:bg-blue-50 hover:border-blue-300 gap-3 transition-colors rounded-lg"
                  >
                    <Wallet className="h-8 w-8 text-purple-500" />
                    <span className="text-base">Transferencia</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-8 hover:bg-blue-50 hover:border-blue-300 gap-3 transition-colors rounded-lg"
                  >
                    <ShoppingCart className="h-8 w-8 text-orange-500" />
                    <span className="text-base">Móvil</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="space-y-4 mt-8">
              <Button
                size="lg"
                className="w-full py-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all text-lg"
                disabled={true}
              >
                Procesar Venta
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full border-gray-300 hover:bg-gray-100 rounded-lg py-4 text-base"
              >
                <Link href="/admin/pos">Cancelar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
