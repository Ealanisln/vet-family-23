"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Search, AlertTriangle } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
import { Badge, BadgeProps } from "@/components/ui/custom-badge";
import { toast } from "@/components/ui/use-toast";

import { InventoryFormItem } from "@/types/inventory";
import { InventoryStatus } from "@prisma/client";
import { getInventory } from "@/app/actions/inventory";

import ItemDetails from "./ui/ItemDetails";

interface VaccineTableProps {
  onRowClick?: (item: InventoryFormItem) => void;
}

const VaccineTable: React.FC<VaccineTableProps> = ({ onRowClick }) => {
  // States with proper typing
  const [data, setData] = useState<InventoryFormItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<
    InventoryStatus | "all_statuses" | null
  >(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<InventoryFormItem | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Helper functions with type safety
  const getStatusBadgeVariant = (
    status: InventoryStatus
  ): BadgeProps["variant"] => {
    const statusMap: Record<InventoryStatus, BadgeProps["variant"]> = {
      ACTIVE: "success",
      INACTIVE: "secondary",
      LOW_STOCK: "warning",
      OUT_OF_STOCK: "destructive",
      EXPIRED: "destructive",
    };
    return statusMap[status];
  };

  const formatDate = (date: string | null): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Column definitions with proper typing
  const columns: ColumnDef<InventoryFormItem>[] = [
    {
      accessorKey: "name",
      header: "Nombre de Vacuna",
      cell: ({ row }) => {
        const isLowStock = ["LOW_STOCK", "OUT_OF_STOCK"].includes(
          row.original.status
        );
        const name = row.getValue("name") as string;
        const presentation = row.original.presentation;
        const measure = row.original.measure;

        const displayName = `${name}${
          presentation && measure
            ? ` ${presentation} - ${measure}`
            : presentation
              ? ` (${presentation})`
              : measure
                ? ` (${measure})`
                : ""
        }`;

        return (
          <button
            onClick={() => {
              setSelectedItem(row.original);
              setIsDetailsOpen(true);
              onRowClick?.(row.original);
            }}
            className="flex items-center gap-2 hover:text-[#47b3b6] transition-colors"
          >
            <span className="font-medium">{displayName}</span>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "batchNumber",
      header: "Número de Lote",
      cell: ({ row }) => row.original.batchNumber || "-",
    },
    {
      accessorKey: "quantity",
      header: "Dosis Disponibles",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as InventoryStatus;
        const statusMap: Record<InventoryStatus, string> = {
          ACTIVE: "Activo",
          INACTIVE: "Inactivo",
          LOW_STOCK: "Stock Bajo",
          OUT_OF_STOCK: "Sin Stock",
          EXPIRED: "Expirado",
        };
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {statusMap[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expirationDate",
      header: "Fecha de Expiración",
      cell: ({ row }) => formatDate(row.getValue("expirationDate") as string),
    },
    {
      accessorKey: "specialNotes",
      header: "Notas Especiales",
      cell: ({ row }) => row.original.specialNotes || "-",
    },
  ];

  // Fetch inventory with proper typing
  const fetchVaccines = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getInventory();
      if (result.success && result.items) {
        // Filter only vaccine items
        const vaccineItems = result.items
          .filter((item) => item.category === "VACCINE")
          .map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
            movements: item.movements.map((movement) => ({
              ...movement,
              date: new Date(movement.date),
            })),
          }));
        setData(vaccineItems);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al cargar vacunas",
        });
        setData([]);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error inesperado al cargar vacunas",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  // Filter data based on status
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesStatus =
        !statusFilter ||
        statusFilter === "all_statuses" ||
        item.status === statusFilter;
      return matchesStatus;
    });
  }, [data, statusFilter]);

  // Table configuration with proper typing
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <>
      <Card className="w-full bg-gradient-to-br from-white via-white to-blue-50 border-none shadow-lg">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-4 w-4 text-[#47b3b6]" />
                </div>
                <Input
                  placeholder="Buscar vacunas..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
                />
              </div>
              <Select
                value={statusFilter || "all_statuses"}
                onValueChange={(value: InventoryStatus | "all_statuses") =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">
                    Todos los estados
                  </SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="LOW_STOCK">Stock Bajo</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Sin Stock</SelectItem>
                  <SelectItem value="EXPIRED">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded-xl border border-[#47b3b6]/20 bg-white">
            <div className="min-w-[800px]">
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
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#47b3b6]"></div>
                          <p className="mt-2 text-gray-600">
                            Cargando vacunas...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
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
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-gray-600"
                      >
                        No se encontraron vacunas en el inventario.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-2 mt-4">
            <div className="text-sm text-gray-500">
              {table.getFilteredRowModel().rows.length} vacunas encontradas
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

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Vacuna</DialogTitle>
            <DialogDescription>
              Información detallada y movimientos de la vacuna seleccionada.
            </DialogDescription>
          </DialogHeader>
          <ItemDetails selectedItem={selectedItem} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6]"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VaccineTable;
