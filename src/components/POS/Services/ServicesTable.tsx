// src/components/POS/Services/ServicesTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface ServicesTableProps {
  services: Service[];
  pagination?: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  onFilterChange?: (filters: any) => void;
}

export default function ServicesTable({
  services,
  pagination,
  onFilterChange,
}: ServicesTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange({
        search: searchTerm,
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        isActive:
          statusFilter === "ACTIVE"
            ? true
            : statusFilter === "INACTIVE"
              ? false
              : undefined,
      });
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");

    if (onFilterChange) {
      onFilterChange({});
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Servicios</CardTitle>
            <CardDescription>
              {services.length} servicio(s) disponible(s)
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/pos/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar servicios..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[170px]">
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
                <SelectTrigger className="w-[130px]">
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

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCcw className="h-4 w-4 mr-1" />
              Reiniciar
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Tabla */}
        {services.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/pos/servicios/${service.id}`}
                        className="hover:underline"
                      >
                        {service.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {translateServiceCategory(service.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>
                      {service.duration ? (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {service.duration} min
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
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
                          className="h-8 w-8"
                          asChild
                        >
                          <Link
                            href={`/admin/pos/servicios/${service.id}/editar`}
                          >
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
                          <Link
                            href={`/admin/pos/servicios/${service.id}/eliminar`}
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
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <div className="mx-auto h-12 w-12 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-gray-500">No hay servicios</h3>
            <p className="text-sm text-gray-400">
              No se encontraron servicios con los filtros seleccionados
            </p>
            {(searchTerm ||
              categoryFilter !== "ALL" ||
              statusFilter !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={handleReset}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Botón de nuevo servicio (móvil) */}
        <div className="mt-6 sm:hidden">
          <Button asChild className="w-full">
            <Link href="/admin/pos/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
