// src/components/Inventory/Medicine.tsx

"use client";

import * as React from "react";
import { useState } from "react";
import { Search, AlertTriangle, Plus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/ui/loader";
import { Badge, type BadgeProps } from "@/components/ui/custom-badge";
import { toast } from "@/components/ui/use-toast";
import { getInventory, updateInventoryItem } from "@/app/actions/inventory";
import type {
  InventoryStatus,
  MovementType,
  InventoryCategory,
} from "@prisma/client";
import InventoryItemForm from "../Inventory/ui/InventoryItemForm";

// Interfaces y tipos
type MedicineItem = {
  id: string;
  name: string;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  quantity: number;
  minStock: number | null;
  location: string | null;
  expirationDate: string | null;
  status: InventoryStatus;
  batchNumber: string | null;
  specialNotes: string | null;
  movements: {
    id: string;
    date: string;
    quantity: number;
    itemId: string;
    type: MovementType;
    reason: string | null;
    userId: string | null;
    relatedRecordId: string | null;
    notes: string | null;
    user: {
      name: string | null;
    } | null;
  }[];
  category: InventoryCategory;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

type InventoryItemFormData = {
  name: string;
  category: InventoryCategory;
  quantity: number;
  minStock?: number | null;
  location?: string | null;
  description?: string | null;
  activeCompound?: string | null;
  presentation?: string | null;
  measure?: string | null;
  brand?: string | null;
  batchNumber?: string | null;
  specialNotes?: string | null;
  expirationDate: string | null;
};

// Funciones auxiliares
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

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function MedicineInventory() {
  const [data, setData] = useState<MedicineItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | null>(
    null
  );
  const [globalFilter, setGlobalFilter] = useState("");

  // Estados para modal y edición
  const [selectedItem, setSelectedItem] = useState<MedicineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    async function fetchMedicines() {
      try {
        setLoading(true);
        setError(null);
        const result = await getInventory();
        if (result.success && result.items) {
          const formattedItems = result.items.map((item) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
            movements: item.movements.map((movement) => ({
              ...movement,
              date: new Date(movement.date).toISOString(),
            })),
          }));
          setData(formattedItems);
        } else {
          setError(result.error || "Failed to fetch medicines");
          setData([]);
        }
      } catch (error) {
        setError("An unexpected error occurred");
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMedicines();
  }, []);

  const handleEditSubmit = async (formData: InventoryItemFormData) => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);

      const updateData = {
        name: formData.name,
        quantity: formData.quantity,
        minStock: formData.minStock || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        activeCompound: formData.activeCompound || undefined,
        presentation: formData.presentation || undefined,
        measure: formData.measure || undefined,
        brand: formData.brand || undefined,
        batchNumber: formData.batchNumber || undefined,
        specialNotes: formData.specialNotes || undefined,
        expirationDate: formData.expirationDate,
        status: selectedItem.status,
        category: formData.category,
      };

      const result = await updateInventoryItem(
        selectedItem.id,
        updateData,
        "system"
      );

      if (!result.success) {
        throw new Error(result.error || "Error al actualizar item");
      }

      setIsEditFormOpen(false);
      setIsDialogOpen(false);

      // Refrescar la lista de medicamentos
      const refreshResult = await getInventory();
      if (refreshResult.success && refreshResult.items) {
        const formattedItems = refreshResult.items.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
          movements: item.movements.map((movement) => ({
            ...movement,
            date: new Date(movement.date).toISOString(),
          })),
        }));
        setData(formattedItems);
      }

      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description:
          error instanceof Error
            ? error.message
            : "Error inesperado al actualizar el item",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItemDetails = () => {
    if (!selectedItem) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-500">Detalles Básicos</h4>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Nombre:</span> {selectedItem.name}
              </p>
              <p>
                <span className="font-medium">Categoría:</span>{" "}
                {selectedItem.category}
              </p>
              <p>
                <span className="font-medium">Cantidad:</span>{" "}
                {selectedItem.quantity}
              </p>
              <p>
                <span className="font-medium">Stock Mínimo:</span>{" "}
                {selectedItem.minStock || "-"}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-500">Información Adicional</h4>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Ubicación:</span>{" "}
                {selectedItem.location || "-"}
              </p>
              <p>
                <span className="font-medium">Presentación:</span>{" "}
                {selectedItem.presentation || "-"}
              </p>
              <p>
                <span className="font-medium">Medida:</span>{" "}
                {selectedItem.measure || "-"}
              </p>
              <p>
                <span className="font-medium">Marca:</span>{" "}
                {selectedItem.brand || "-"}
              </p>
            </div>
          </div>
        </div>

        {selectedItem.description && (
          <div>
            <h4 className="font-medium text-gray-500">Descripción</h4>
            <p className="mt-1">{selectedItem.description}</p>
          </div>
        )}

        {selectedItem.activeCompound && (
          <div>
            <h4 className="font-medium text-gray-500">Compuesto Activo</h4>
            <p className="mt-1">{selectedItem.activeCompound}</p>
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-500 mb-2">
            Últimos Movimientos
          </h4>
          <div className="space-y-2">
            {selectedItem.movements.map((movement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span
                  className={
                    movement.type === "IN" ? "text-green-600" : "text-red-600"
                  }
                >
                  {movement.type === "IN" ? "+" : "-"}
                  {movement.quantity}
                </span>
                <span className="text-gray-500">
                  {formatDate(movement.date)}
                </span>
                {movement.user?.name && (
                  <span className="text-gray-400">
                    por {movement.user.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Definición de columnas
  const columns: ColumnDef<MedicineItem>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const isLowStock =
          row.original.status === "LOW_STOCK" ||
          row.original.status === "OUT_OF_STOCK";
        return (
          <button
            onClick={() => {
              setSelectedItem(row.original);
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 hover:text-[#47b3b6] transition-colors"
          >
            <span className="font-medium">{row.getValue("name")}</span>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "activeCompound",
      header: "Compuesto Activo",
      cell: ({ row }) => row.getValue("activeCompound") || "-",
    },
    {
      accessorKey: "presentation",
      header: "Presentación",
      cell: ({ row }) => row.getValue("presentation") || "-",
    },
    {
      accessorKey: "measure",
      header: "Medida",
      cell: ({ row }) => row.getValue("measure") || "-",
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
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => row.getValue("location") || "-",
    },
    {
      accessorKey: "expirationDate",
      header: "Fecha de Expiración",
      cell: ({ row }) =>
        formatDate(row.getValue("expirationDate") as string | null),
    },
    {
      accessorKey: "batchNumber",
      header: "Número de Lote",
      cell: ({ row }) => row.getValue("batchNumber") || "-",
    },
  ];

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesStatus;
    });
  }, [data, statusFilter]);

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
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const searchableColumns = [
        "name",
        "activeCompound",
        "presentation",
        "location",
        "batchNumber",
      ];

      return searchableColumns.some((column) => {
        const value = row.getValue(column);
        return value
          ? String(value).toLowerCase().includes(searchValue)
          : false;
      });
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <Card className="w-full bg-gradient-to-br from-white via-white to-blue-50 border-none shadow-lg">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header y Filtros */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-[#47b3b6]" />
              </div>
              <Input
                placeholder="Buscar medicamentos..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter || "all_statuses"}
                onValueChange={(value) =>
                  setStatusFilter(
                    value === "all_statuses" ? null : (value as InventoryStatus)
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
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
        </div>

        {/* Tabla */}
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
                      <Loader size={32} className="mx-auto text-[#47b3b6]" />
                      <p className="mt-2 text-gray-600">
                        Cargando medicamentos...
                      </p>
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
                      No se encontraron medicamentos en el inventario.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Paginación */}
        <div className="flex justify-end gap-2 mt-4">
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

      {/* Modal de Detalles */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Medicamento</DialogTitle>
            <DialogDescription>
              Información detallada y movimientos del medicamento seleccionado.
            </DialogDescription>
          </DialogHeader>
          {renderItemDetails()}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6]"
            >
              Cerrar
            </Button>
            {selectedItem && (
              <Button
                onClick={() => {
                  setIsEditFormOpen(true);
                  setIsDialogOpen(false);
                }}
                className="bg-[#47b3b6] hover:bg-[#47b3b6]/90 text-white"
              >
                Editar Medicamento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulario de Edición */}
      <InventoryItemForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        initialData={
          selectedItem
            ? {
                ...selectedItem,
                createdAt: selectedItem.createdAt.toISOString(),
                updatedAt: selectedItem.updatedAt?.toISOString() || null,
                movements: selectedItem.movements.map((movement) => ({
                  ...movement,
                  date: new Date(movement.date).toISOString(),
                })),
              }
            : null
        }
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
}
