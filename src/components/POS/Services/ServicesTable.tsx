// src/components/POS/Services/ServicesTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation"; // <--- Eliminado: No se usaba
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Search,
  Plus,
  Clock,
  Filter,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { formatCurrency, translateServiceCategory } from "@/utils/pos-helpers";
import type { Service } from "@/types/pos";

// --- Definición del tipo para los filtros ---
interface ServiceFilters {
  search?: string;
  category?: string; // Será 'undefined' si es 'ALL'
  isActive?: boolean; // Será 'undefined' si es 'ALL', true si 'ACTIVE', false si 'INACTIVE'
}

interface ServicesTableProps {
  services: Service[];
  // --- Eliminado: Prop 'pagination' no utilizada ---
  // pagination?: {
  //   total: number;
  //   pages: number;
  //   page: number;
  //   limit: number;
  // };
  // --- Corregido: Tipo específico para los filtros ---
  onFilterChange?: (filters: ServiceFilters) => void;
}

export default function ServicesTable({
  services,
  // pagination, // <--- Eliminado
  onFilterChange,
}: ServicesTableProps) {
  // const router = useRouter(); // <--- Eliminado: No se usaba
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleSearch = () => {
    if (onFilterChange) {
      // Construye el objeto de filtros con el tipo correcto
      const filters: ServiceFilters = {
        search: searchTerm || undefined, // Pasa undefined si está vacío para claridad
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        isActive:
          statusFilter === "ACTIVE"
            ? true
            : statusFilter === "INACTIVE"
              ? false
              : undefined,
      };
      onFilterChange(filters);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");

    if (onFilterChange) {
      // Pasa un objeto vacío para indicar que no hay filtros activos
      onFilterChange({});
    }
  };

  // Definición de categorías (sin cambios, pero revisada)
  const serviceCategories = [
    { value: "ALL", label: "Todas las categorías" },
    { value: "CONSULTATION", label: "Consultas" },
    { value: "SURGERY", label: "Cirugías" },
    { value: "VACCINATION", label: "Vacunación" },
    { value: "GROOMING", label: "Estética" },
    { value: "DENTAL", label: "Dental" },
    { value: "LABORATORY", label: "Laboratorio" },
    { value: "IMAGING", label: "Imagenología" },
    { value: "HOSPITALIZATION", label: "Hospitalización" },
    { value: "OTHER", label: "Otros" },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Contenedor para título y descripción */}
          <div>
            <CardTitle>Servicios</CardTitle>
            <CardDescription>
              {/* Podrías mostrar el total de servicios si tuvieras la prop pagination */}
              {/* O simplemente mostrar los servicios actuales */}
              {services.length} servicio(s) en esta vista
            </CardDescription>
          </div>
          {/* Botón de Nuevo Servicio (visible en todos los tamaños aquí) */}
          {/* Considera si quieres ocultarlo en móvil si ya tienes el botón abajo */}
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/pos/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* --- Sección de Filtros --- */}
        <div className="mb-4 space-y-4 border-b pb-4"> {/* Añadido borde para separar visualmente */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Input de búsqueda */}
            <div className="relative flex-grow"> {/* Cambiado flex-1 a flex-grow */}
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nombre..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // Opcional: Filtrar al escribir (si se prefiere sobre el botón "Filtrar")
                // onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Selectores de Categoría y Estado */}
            <div className="flex gap-2 flex-wrap"> {/* Añadido flex-wrap */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                {/* Ajustado ancho mínimo para mejor adaptabilidad */}
                <SelectTrigger className="min-w-[170px] flex-grow sm:flex-grow-0">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                {/* Ajustado ancho mínimo */}
                <SelectTrigger className="min-w-[130px] flex-grow sm:flex-grow-0">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de Acción de Filtros */}
          <div className="flex justify-end gap-2"> {/* Cambiado justify-between a justify-end */}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Reiniciar
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
          </div>
        </div> {/* Fin Sección de Filtros */}


        {/* --- Tabla de Servicios o Mensaje de "No hay servicios" --- */}
        {services.length > 0 ? (
          <div className="border rounded-md overflow-x-auto"> {/* Añadido overflow para tablas anchas */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead> {/* Alineado a la derecha */}
                  <TableHead className="text-center">Duración</TableHead> {/* Centrado */}
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/pos/servicios/${service.id}`}
                        className="hover:underline text-primary" // Estilo de link más obvio
                      >
                        {service.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary"> {/* Usar variant="secondary" para consistencia */}
                        {translateServiceCategory(service.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right"> {/* Alineado a la derecha */}
                      {formatCurrency(service.price)}
                    </TableCell>
                    <TableCell className="text-center"> {/* Centrado */}
                      {service.duration ? (
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {service.duration} min
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.isActive ? (
                        <Badge
                          variant="outline"
                          className="border-green-300 bg-green-50 text-green-700" // Ajuste de colores sutil
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-red-300 bg-red-50 text-red-700" // Ajuste de colores sutil
                        >
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          asChild
                          title="Editar Servicio" // Añadido title para accesibilidad
                        >
                          <Link
                            href={`/admin/pos/servicios/${service.id}/editar`}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                        {/* Considera un modal de confirmación antes de enlazar a eliminar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          asChild
                          title="Eliminar Servicio" // Añadido title para accesibilidad
                        >
                          {/* Idealmente, esto abriría un modal/confirmación en lugar de navegar directamente */}
                          <Link
                            href={`/admin/pos/servicios/${service.id}/eliminar`} // Asegúrate que esta ruta maneje la confirmación
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          // --- Mensaje cuando no hay servicios ---
          <div className="text-center py-16 border rounded-md bg-muted/20"> {/* Ajuste de estilos */}
            {/* Ícono más representativo (ej: un cubo vacío o similar) */}
             <div className="mx-auto h-12 w-12 text-muted-foreground">
               {/* Puedes usar un ícono de Lucide o mantener el SVG */}
               <XCircle strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No se encontraron servicios
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || categoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "Intenta ajustar tus filtros de búsqueda."
                : "Aún no has creado ningún servicio."}
            </p>
            {/* Botón para limpiar filtros si hay filtros aplicados */}
            {(searchTerm ||
              categoryFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={handleReset}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Limpiar filtros
              </Button>
            )}
             {/* Botón para crear si no hay filtros y no hay servicios */}
            {!(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL') && (
                 <Button size="sm" className="mt-6" asChild>
                   <Link href="/admin/pos/servicios/nuevo">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Crear Nuevo Servicio
                   </Link>
                 </Button>
            )}
          </div>
        )}

        {/* --- Botón flotante o fijo para añadir en móvil (Opcional si ya está arriba) --- */}
        {/* Si el botón de arriba es visible en móvil (sm:w-auto), este podría no ser necesario */}
        {/* <div className="mt-6 sm:hidden">
          <Button asChild className="w-full">
            <Link href="/admin/pos/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div> */}

        {/* --- Añadir controles de paginación aquí si es necesario --- */}
        {/* Si decides usar la prop 'pagination', aquí irían los botones/indicadores */}
        {/* Ejemplo básico (necesitarías la prop 'pagination' de nuevo):
           {pagination && pagination.pages > 1 && (
             <div className="mt-4 flex justify-center items-center space-x-2">
               <Button variant="outline" size="sm" disabled={pagination.page <= 1}>Anterior</Button>
               <span>Página {pagination.page} de {pagination.pages}</span>
               <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages}>Siguiente</Button>
             </div>
           )}
        */}
      </CardContent>
    </Card>
  );
}