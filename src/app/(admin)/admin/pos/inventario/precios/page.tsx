// src/app/(admin)/admin/pos/inventario/precios/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient, InventoryCategory } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Calculator, Percent, DollarSign, Tag, TrendingUp } from "lucide-react";
import { translateInventoryCategory } from "@/utils/pos-helpers";
import { formatCurrency } from "@/utils/pos-helpers";
import { calculateMargin } from "@/app/actions/pos/inventory-price";
import { PriceForm } from "@/components/pos/PriceForm";
import { BulkPriceAdjustment } from "@/components/pos/BulkPriceAdjustment";
import { MarginCalculator } from "@/components/pos/MarginCalculator";

// Implementación del patrón singleton para PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export const metadata: Metadata = {
  title: "Gestión de Precios | Inventario POS",
  description: "Administra los precios y costos de los productos del inventario"
};

export const dynamic = "force-dynamic"; // Asegurarse de que la página se renderiza en cada solicitud

export default async function PriceManagementPage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    search?: string;
    page?: string;
  };
}) {
  // Verificar que el usuario tiene permisos
  const { getRoles, isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }
  
  const roles = await getRoles();
  const isAdmin = roles?.some((role) => role.key === "admin");
  
  if (!isAdmin) {
    redirect("/admin");
  }
  
  // Obtener parámetros de búsqueda y paginación
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const category = searchParams.category as InventoryCategory | null;
  const search = searchParams.search || "";
  const limit = 10;
  
  // Construir la consulta
  const whereClause: any = {};
  
  if (category) {
    whereClause.category = category;
  }
  
  if (search) {
    whereClause.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }
  
  // Obtener los productos paginados
  const [products, categoriesCount, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryItem.groupBy({
      by: ['category'],
      _count: { category: true },
    }),
    prisma.inventoryItem.count({ where: whereClause }),
  ]);
  
  // Calcular páginas totales
  const totalPages = Math.ceil(total / limit);
  
  // Obtener todas las categorías disponibles
  const categories = categoriesCount.map(c => c.category);
  
  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link
          href="/admin/pos/inventario"
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al Inventario
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Gestión de Precios y Costos</h1>
      
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="bulk-adjustments">Ajustes Masivos</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora de Márgenes</TabsTrigger>
        </TabsList>
        
        {/* Pestaña de Productos */}
        <TabsContent value="products" className="space-y-6">
          {/* Filtros de búsqueda */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Buscar Productos</CardTitle>
              <CardDescription>
                Filtrar productos por nombre o categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search">Buscar</Label>
                  <Input 
                    id="search" 
                    name="search" 
                    placeholder="Buscar por nombre o descripción..." 
                    defaultValue={search}
                  />
                </div>
                
                <div className="w-full sm:w-48 space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select name="category" defaultValue={category || ""}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {translateInventoryCategory(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full sm:w-auto">Filtrar</Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Tabla de Productos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Listado de Productos ({total})
              </CardTitle>
              <CardDescription>
                Administra los precios y costos de los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Margen</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No se encontraron productos con los filtros aplicados
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const margin = calculateMargin(product.price, product.cost);
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            <div>{product.name}</div>
                            <div className="text-xs text-gray-500">
                              Stock: {product.quantity}
                            </div>
                          </TableCell>
                          <TableCell>
                            {translateInventoryCategory(product.category)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                              {product.cost ? formatCurrency(product.cost) : "No definido"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <Tag className="h-3 w-3 text-green-600 mr-1" />
                              {product.price ? formatCurrency(product.price) : "No definido"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {margin !== null ? (
                              <div className="flex items-center justify-end">
                                <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                                {margin}%
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <PriceForm 
                              productId={product.id}
                              initialPrice={product.price}
                              initialCost={product.cost}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
                <TableCaption>
                  Mostrando {products.length} de {total} productos
                </TableCaption>
              </Table>
            </CardContent>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <CardFooter className="flex justify-center py-4">
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    const pageUrl = new URL(
                      `/admin/pos/inventario/precios`,
                      "http://localhost"
                    );
                    
                    if (search) pageUrl.searchParams.set("search", search);
                    if (category) pageUrl.searchParams.set("category", category);
                    pageUrl.searchParams.set("page", pageNumber.toString());
                    
                    return (
                      <Link key={i} href={pageUrl.pathname + pageUrl.search}>
                        <Button
                          variant={pageNumber === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNumber}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {/* Pestaña de Ajustes Masivos */}
        <TabsContent value="bulk-adjustments">
          <BulkPriceAdjustment categories={categories} />
        </TabsContent>
        
        {/* Pestaña de Calculadora */}
        <TabsContent value="calculator">
          <MarginCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}