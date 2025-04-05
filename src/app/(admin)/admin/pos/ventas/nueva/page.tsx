// src/app/(admin)/admin/pos/ventas/nueva/page.tsx
'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  Search,
  Plus,
  User as UserIcon,
  CreditCard,
  Wallet,
  BanknoteIcon,
  PawPrint,
  ChevronRight,
  ChevronLeft,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/utils/pos-helpers";
import type { InventoryCategory, User, Pet } from "@prisma/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { CartSummary } from "@/components/POS/CartSummary";
import { useEffect, useState } from "react";
import type { InventoryItemWithPrice } from "@/lib/type-adapters";
import { loadSalePageData, type SalePageData } from "@/app/actions/pos/load-sale-page";
import { useRouter } from "next/navigation";
import { CATEGORY_TRANSLATIONS } from "@/utils/category-translations";
import { ClientSelectionDialog } from "@/components/POS/ClientSelectionDialog";
import { PetSelectionDialog } from "@/components/POS/PetSelectionDialog";

export const dynamic = "force-dynamic";

// Type definitions
type SearchParams = {
  category?: string;
  search?: string;
  tab?: string;
  page?: string;
};

export default function NewSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [pageData, setPageData] = useState<SalePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para selección de cliente y mascota
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await loadSalePageData({
          category: searchParams.category,
          search: searchParams.search,
          page: searchParams.page,
        });
        setPageData(data);
      } catch (error) {
        console.error("Error loading page data:", error);
        toast.error("Error al cargar los datos");
        router.push("/admin/pos");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [searchParams, router]);

  const handleAddProduct = (product: InventoryItemWithPrice) => {
    const cartItem = {
      id: product.id,
      type: 'product' as const,
      name: product.name,
      description: product.description || "",
      quantity: 1,
      unitPrice: product.price || 0,
      category: product.category,
      stock: product.quantity
    };

    addItem(cartItem);
    toast.success(`${product.name} agregado al carrito`);
  };

  // Manejadores para la selección de cliente y mascota
  const handleClientSelect = (client: User | null) => {
    setSelectedClient(client);
    setSelectedPet(null); // Resetear mascota al cambiar de cliente
  };

  const handlePetSelect = (pet: Pet | null) => {
    setSelectedPet(pet);
  };

  if (isLoading || !pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const { inventoryResult } = pageData;

  // Common categories for filters - Updated with more relevant categories
  const commonCategories: InventoryCategory[] = [
    "MEDICINE",
    "VACCINE",
    "FOOD",
    "ACCESSORY",
    "CONSUMABLE",
    "DEWORMERS",
    "ANTIBIOTIC",
    "ANTI_INFLAMMATORY_ANALGESICS",
    "ANTISEPTICS_HEALING",
    "DERMATOLOGY",
    "OPHTHALMIC",
    "OTIC"
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
      <div className="container mx-auto py-6 px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel - Product/Service selection */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="products" className="w-full">
              <div className="bg-white rounded-xl shadow-sm">
                <TabsList className="w-full grid grid-cols-2 bg-white">
                  <TabsTrigger
                    value="products"
                    className="flex items-center justify-center gap-2 px-4 py-4 text-base font-medium text-gray-600 transition-all data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:text-blue-600 border-b border-gray-200"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Productos
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="flex items-center justify-center gap-2 px-4 py-4 text-base font-medium text-gray-600 transition-all data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:text-blue-600 border-b border-gray-200"
                  >
                    <Tag className="h-5 w-5" />
                    Servicios
                  </TabsTrigger>
                </TabsList>

                {/* Products Tab */}
                <TabsContent value="products" className="focus-visible:outline-none focus-visible:ring-0">
                  <div className="p-6 space-y-6">
                    {/* Search and filters */}
                    <div className="flex flex-col sm:flex-row gap-4 pb-4">
                      <form className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          name="search"
                          placeholder="Buscar productos..."
                          className="pl-11 py-2.5 text-base bg-white border-gray-200 focus-visible:ring-blue-500 rounded-lg"
                        />
                      </form>
                    </div>

                    {/* Category filters */}
                    <div className="flex flex-wrap gap-2">
                      <Link href="/admin/pos/ventas/nueva?tab=products">
                        <Badge
                          variant={!searchParams.category ? "default" : "outline"}
                          className={`cursor-pointer transition-all text-sm py-1.5 px-3 ${
                            !searchParams.category
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
                            variant={searchParams.category === cat ? "default" : "outline"}
                            className={`cursor-pointer transition-all text-sm py-1.5 px-3 ${
                              searchParams.category === cat
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {CATEGORY_TRANSLATIONS[cat]}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {/* Products grid */}
                    {inventoryResult.products.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-xl mt-6">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-base font-medium text-gray-600">
                          No se encontraron productos
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Intenta con otra búsqueda o categoría
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                        {inventoryResult.products.map((product) => (
                          <Card
                            key={product.id}
                            className="group overflow-hidden border border-gray-200 rounded-xl shadow-sm hover:border-blue-200 hover:shadow transition-all duration-200 bg-white"
                          >
                            <div className="p-4 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-3">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {CATEGORY_TRANSLATIONS[product.category as keyof typeof CATEGORY_TRANSLATIONS]}
                                </Badge>

                                {product.quantity <= 10 && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0.5 rounded-md ${
                                      product.quantity <= 5
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-amber-50 text-amber-600 border-amber-200"
                                    }`}
                                  >
                                    Stock: {product.quantity}
                                  </Badge>
                                )}
                              </div>

                              <h3 className="font-medium text-base line-clamp-1 text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </h3>

                              <p className="text-sm text-gray-500 line-clamp-2 mb-3 max-h-10">
                                {product.description || "Sin descripción"}
                              </p>

                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                <span className="font-medium text-base text-emerald-600">
                                  {formatCurrency(product.price || 0)}
                                </span>

                                <Button 
                                  onClick={() => handleAddProduct(product)}
                                  disabled={product.quantity <= 0}
                                  className="gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-0 text-sm font-medium transition-colors"
                                >
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
                          <Link
                            href={`/admin/pos/ventas/nueva?tab=products&page=${Math.max(
                              1,
                              inventoryResult.pagination.page - 1
                            )}${searchParams.category ? `&category=${searchParams.category}` : ""}${
                              searchParams.search ? `&search=${searchParams.search}` : ""
                            }`}
                            className={`p-2 rounded-lg ${
                              inventoryResult.pagination.page <= 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            aria-disabled={inventoryResult.pagination.page <= 1}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Link>

                          {Array.from({
                            length: inventoryResult.pagination.pages,
                          }).map((_, i) => {
                            const pageNum = i + 1;
                            const isCurrentPage = pageNum === inventoryResult.pagination.page;
                            const isFirstPage = pageNum === 1;
                            const isLastPage = pageNum === inventoryResult.pagination.pages;
                            const isNearCurrentPage =
                              Math.abs(pageNum - inventoryResult.pagination.page) <= 1;

                            if (
                              !isFirstPage &&
                              !isLastPage &&
                              !isNearCurrentPage
                            ) {
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
                                  searchParams.category ? `&category=${searchParams.category}` : ""
                                }${searchParams.search ? `&search=${searchParams.search}` : ""}`}
                              >
                                <Button
                                  variant={isCurrentPage ? "default" : "outline"}
                                  size="icon"
                                  className={`w-9 h-9 rounded-lg ${
                                    isCurrentPage
                                      ? "bg-blue-500 text-white hover:bg-blue-600"
                                      : "text-gray-600 hover:bg-gray-100 border-gray-200"
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              </Link>
                            );
                          })}

                          <Link
                            href={`/admin/pos/ventas/nueva?tab=products&page=${Math.min(
                              inventoryResult.pagination.pages,
                              inventoryResult.pagination.page + 1
                            )}${searchParams.category ? `&category=${searchParams.category}` : ""}${
                              searchParams.search ? `&search=${searchParams.search}` : ""
                            }`}
                            className={`p-2 rounded-lg ${
                              inventoryResult.pagination.page >= inventoryResult.pagination.pages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </nav>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="focus-visible:outline-none focus-visible:ring-0">
                  <div className="p-6 space-y-6">
                    <div className="relative max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Buscar servicios..."
                        className="pl-11 py-2.5 text-base bg-white border-gray-200 focus-visible:ring-blue-500 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pageData.services.map((service) => (
                        <Card
                          key={service.id}
                          className="group overflow-hidden border border-gray-200 rounded-xl shadow-sm hover:border-blue-200 hover:shadow transition-all duration-200 bg-white"
                        >
                          <div className="p-4 flex flex-col h-full">
                            <h3 className="font-medium text-base mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                              {service.name}
                            </h3>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                              {service.description || "Sin descripción"}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                              <span className="font-medium text-base text-emerald-600">
                                {formatCurrency(service.price)}
                              </span>

                              <Button 
                                className="gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-0 text-sm font-medium transition-colors"
                              >
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
              </div>
            </Tabs>
          </div>

          {/* Right panel - Sale summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Client and Pet selection */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-3 px-4 pt-4 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Información de venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 h-auto py-3.5 px-4 hover:bg-blue-50 rounded-none border-b"
                  onClick={() => setIsClientDialogOpen(true)}
                >
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-sm text-gray-700">Cliente</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    {selectedClient === null ? (
                      <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                        Venta al Público
                      </Badge>
                    ) : selectedClient ? (
                      <span className="text-sm">
                        {selectedClient.firstName} {selectedClient.lastName}
                      </span>
                    ) : (
                      <span className="text-sm">Seleccionar</span>
                    )}
                    <ChevronRight className="h-4.5 w-4.5 ml-1.5" />
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-700 h-auto py-3.5 px-4 hover:bg-blue-50 rounded-none"
                  onClick={() => selectedClient && setIsPetDialogOpen(true)}
                  disabled={!selectedClient || selectedClient === null}
                >
                  <div className="flex items-center gap-3">
                    <PawPrint className="h-4.5 w-4.5 text-blue-500" />
                    <span className="text-sm text-gray-700">Mascota</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    {selectedPet ? (
                      <span className="text-sm">{selectedPet.name}</span>
                    ) : (
                      <span className="text-sm">
                        {selectedClient === null 
                          ? "No disponible en venta al público"
                          : selectedClient 
                          ? "Seleccionar" 
                          : "Seleccione un cliente"}
                      </span>
                    )}
                    <ChevronRight className="h-4.5 w-4.5 ml-1.5" />
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Cart items */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-3 px-4 pt-4 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Artículos en la venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CartSummary />
              </CardContent>
            </Card>

            {/* Sale totals */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-3 px-4 pt-4 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Resumen de venta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-600">Impuesto (16%):</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-medium text-base py-3 mt-1 border-t">
                  <span>Total:</span>
                  <span className="text-emerald-600">{formatCurrency(0)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment methods */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white">
              <CardHeader className="pb-3 px-4 pt-4 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-medium text-gray-700">
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 hover:bg-blue-50 hover:border-blue-200 gap-2 transition-all rounded-xl"
                  >
                    <BanknoteIcon className="h-6 w-6 text-green-500" />
                    <span className="text-sm">Efectivo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 hover:bg-blue-50 hover:border-blue-200 gap-2 transition-all rounded-xl"
                  >
                    <CreditCard className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">Tarjeta</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 hover:bg-blue-50 hover:border-blue-200 gap-2 transition-all rounded-xl"
                  >
                    <Wallet className="h-6 w-6 text-purple-500" />
                    <span className="text-sm">Transferencia</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-6 hover:bg-blue-50 hover:border-blue-200 gap-2 transition-all rounded-xl"
                  >
                    <ShoppingCart className="h-6 w-6 text-orange-500" />
                    <span className="text-sm">Móvil</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all text-base"
                disabled={true}
              >
                Procesar Venta
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full border-gray-200 hover:bg-gray-100 rounded-xl py-2.5 text-sm"
              >
                <Link href="/admin/pos">Cancelar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogos de selección */}
      <ClientSelectionDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onSelect={handleClientSelect}
      />
      <PetSelectionDialog
        open={isPetDialogOpen}
        onOpenChange={setIsPetDialogOpen}
        onSelect={handlePetSelect}
        selectedClient={selectedClient}
      />
    </div>
  );
}
