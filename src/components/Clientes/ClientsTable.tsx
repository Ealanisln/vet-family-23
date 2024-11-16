"use client";

import * as React from "react";
import { useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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

import { useClientTable } from "@/hooks/useClientTable";
import { createColumns } from "./TableColumns";
import { LoadingTableRow } from "./LoadingTableRow";
import { EmptyTableRow } from "./EmptyTableRow";
import { Search } from "lucide-react";
import { Card } from "../ui";

export default function ClientsTable() {
  const {
    data,
    loading,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination,
    handleDeleteUser,
    loadUsers,
  } = useClientTable();

  // Agregar estado global de búsqueda
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo(
    () => createColumns(handleDeleteUser),
    [handleDeleteUser]
  );

  // Configurar ordenamiento inicial alfabético por nombre
  React.useEffect(() => {
    setSorting([
      {
        id: "firstName",
        desc: false
      }
    ]);
  }, [setSorting]);

  // Función para manejar la búsqueda global
  const handleSearch = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    manualPagination: false,
    // Función de filtro global
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const searchableColumns = ["firstName", "lastName", "email"];
      
      return searchableColumns.some((column) => {
        const value = row.getValue(column);
        return value
          ? String(value).toLowerCase().includes(searchValue)
          : false;
      });
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <Card className="w-full bg-gradient-to-br from-white via-white to-blue-50 border-none shadow-lg">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-[#47b3b6]" />
            </div>
            <Input
              placeholder="Buscar clientes..."
              value={globalFilter}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
            />
          </div>
        </div>
        
        {/* Contenedor de la tabla con scroll horizontal */}
        <div className="overflow-auto rounded-xl border border-[#47b3b6]/20 bg-white">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow 
                    key={headerGroup.id}
                    className="bg-gradient-to-r from-[#47b3b6]/5 to-[#47b3b6]/10 hover:from-[#47b3b6]/10 hover:to-[#47b3b6]/20"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        className="text-[#47b3b6] font-semibold whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
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
                  <LoadingTableRow colSpan={columns.length} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-[#47b3b6]/5 transition-colors duration-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id} 
                          className="text-gray-700 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <EmptyTableRow colSpan={columns.length} />
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer con paginación */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 pt-6">
          <div className="w-full sm:w-auto text-sm text-[#47b3b6] order-2 sm:order-1">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
          </div>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex-1 sm:flex-none border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] disabled:opacity-50"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex-1 sm:flex-none border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6] disabled:opacity-50"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}