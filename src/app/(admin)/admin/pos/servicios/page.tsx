// src/app/(admin)/admin/pos/servicios/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { getServices } from "@/app/actions/pos/services";
import { formatCurrency, translateServiceCategory } from "@/utils/pos-helpers";
import { userHasPOSPermission } from "@/utils/pos-helpers";

export const metadata: Metadata = {
  title: "Servicios | POS",
  description: "Gestión de servicios para el sistema POS"
};

export default async function ServicesPage() {
  // Verificar que el usuario tiene permisos para el POS
  const session = await getServerSession();
  
  if (!session) {
    return redirect("/login");
  }
  
  const hasPermission = await userHasPOSPermission(session.user?.id);
  
  if (!hasPermission) {
    return redirect("/admin");
  }
  
  // Obtener los servicios
  const { services } = await getServices({
    page: 1,
    limit: 100,
    isActive: null
  });
  
  // Agrupar servicios por categoría
  const servicesByCategory: Record<string, any[]> = {};
  
  services.forEach(service => {
    if (!servicesByCategory[service.category]) {
      servicesByCategory[service.category] = [];
    }
    servicesByCategory[service.category].push(service);
  });
  
  // Ordenar categorías
  const sortedCategories = Object.keys(servicesByCategory).sort();
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Servicios</h1>
        
        <Button asChild>
          <Link href="/admin/pos/servicios/nuevo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Link>
        </Button>
      </div>
      
      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-500 mb-4">No hay servicios registrados</p>
            <Button asChild>
              <Link href="/admin/pos/servicios/nuevo">
                Crear Primer Servicio
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map(category => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle>
                  {translateServiceCategory(category)}
                </CardTitle>
                <CardDescription>
                  {servicesByCategory[category].length} servicio(s) en esta categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesByCategory[category].map(service => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.description || "-"}</TableCell>
                        <TableCell>{formatCurrency(service.price)}</TableCell>
                        <TableCell>
                          {service.duration ? `${service.duration} min.` : "-"}
                        </TableCell>
                        <TableCell>
                          {service.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <Link href={`/admin/pos/servicios/${service.id}/editar`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              asChild
                            >
                              <Link href={`/admin/pos/servicios/${service.id}/eliminar`}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Link>
                            </Button>
                          </div