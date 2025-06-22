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
import TablePagination from '@/components/ui/table-pagination';

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

  // Estado global de búsqueda
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isMounted, setIsMounted] = React.useState(false);

  const columns = React.useMemo(
    () => createColumns(handleDeleteUser),
    [handleDeleteUser]
  );

  // Función para manejar la búsqueda global
  const handleSearch = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 10, // Tamaño de página por defecto
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
    onSortingChange: (updater) => {
      if (isMounted) {
        setSorting(updater);
      }
    },
    onColumnFiltersChange: (updater) => {
      if (isMounted) {
        setColumnFilters(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      if (isMounted) {
        setColumnVisibility(updater);
      }
    },
    onRowSelectionChange: (updater) => {
      if (isMounted) {
        setRowSelection(updater);
      }
    },
    onPaginationChange: (updater) => {
      if (isMounted) {
        setPagination(updater);
      }
    },
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
    onGlobalFilterChange: (updater) => {
      if (isMounted) {
        setGlobalFilter(updater);
      }
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadUsers();
    }
  }, [loadUsers, isMounted]);

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

          <TablePagination
            currentPage={table.getState().pagination.pageIndex + 1}
            pageSize={table.getState().pagination.pageSize}
            totalItems={table.getFilteredRowModel().rows.length}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            onPageSizeChange={(size) => table.setPageSize(size)}
          />
      </div>
    </Card>
  );
}