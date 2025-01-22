"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Search, AlertTriangle, Plus } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/ui/loader";
import { Badge } from "@/components/ui/custom-badge";

import { getInventory } from "@/app/actions/inventory";
import { InventoryStatus, MovementType } from "@prisma/client";

const MedicinesView = () => {
  // Estados básicos
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [globalFilter, setGlobalFilter] = useState("");

  // Columnas de la tabla
  const columns = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const isLowStock = ["LOW_STOCK", "OUT_OF_STOCK"].includes(row.original.status);
        const name = row.getValue("name");
        const presentation = row.original.presentation;
        const measure = row.original.measure;
        
        const displayName = `${name}${presentation && measure ? ` ${presentation} - ${measure}` : 
                                    presentation ? ` (${presentation})` : 
                                    measure ? ` (${measure})` : ''}`;
        
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{displayName}</span>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: "Cantidad",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const statusMap = {
          ACTIVE: "Activo",
          INACTIVE: "Inactivo",
          LOW_STOCK: "Stock Bajo",
          OUT_OF_STOCK: "Sin Stock",
          EXPIRED: "Expirado",
        };
        const getVariant = (status) => {
          const variantMap = {
            ACTIVE: "success",
            INACTIVE: "secondary",
            LOW_STOCK: "warning",
            OUT_OF_STOCK: "destructive",
            EXPIRED: "destructive",
          };
          return variantMap[status];
        };
        return (
          <Badge variant={getVariant(status)}>
            {statusMap[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "activeCompound",
      header: "Compuesto Activo",
      cell: ({ row }) => row.getValue("activeCompound") || "-",
    },
    {
      accessorKey: "expirationDate",
      header: "Fecha de Expiración",
      cell: ({ row }) => {
        const date = row.getValue("expirationDate");
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  ];

  // Cargar datos
  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getInventory();
      if (result.success && result.items) {
        // Filtrar solo medicamentos
        const medicines = result.items.filter(item => item.category === "MEDICINE");
        setData(medicines);
      } else {
        setError(result.error || "Error al cargar medicamentos");
        setData([]);
      }
    } catch (error) {
      setError("Error inesperado");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Filtrar por estado
  const filteredData = React.useMemo(() => {
    return data.filter(item => 
      statusFilter === "all_statuses" || item.status === statusFilter
    );
  }, [data, statusFilter]);

  // Configuración de la tabla
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card className="w-full bg-gradient-to-br from-white via-white to-blue-50 border-none shadow-lg">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#47b3b6]" />
            <Input
              placeholder="Buscar medicamentos..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px] h-11">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_statuses">Todos los estados</SelectItem>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="INACTIVE">Inactivo</SelectItem>
              <SelectItem value="LOW_STOCK">Stock Bajo</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Sin Stock</SelectItem>
              <SelectItem value="EXPIRED">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="overflow-auto rounded-xl border border-[#47b3b6]/20 bg-white">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-[#47b3b6]/5 to-[#47b3b6]/10"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[#47b3b6] font-semibold whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <Loader size={32} className="mx-auto text-[#47b3b6]" />
                    <p className="mt-2 text-gray-600">Cargando medicamentos...</p>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-[#47b3b6]/5 transition-colors duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-gray-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-600">
                    No se encontraron medicamentos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} medicamentos encontrados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] disabled:opacity-50"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] disabled:opacity-50"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MedicinesView;