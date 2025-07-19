"use client";

import * as React from "react";
import { useState, useCallback } from "react";
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

// Componentes UI
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
import { Badge, BadgeProps } from "@/components/ui/custom-badge";
import { toast } from "@/components/ui/use-toast";

// Actions y Types
import {
  createInventoryItem,
  getInventory,
  updateInventoryItem,
} from "@/app/actions/inventory";
import {
  InventoryItem,
  InventoryItemFormData,
  UpdateInventoryData,
  GetInventoryResponse,
  UpdateInventoryResponse,
  CreateInventoryResponse,
  InventoryFormItem,
} from "@/types/inventory";
// Manual type definitions due to Prisma client export issues
const InventoryStatus = {
  ACTIVE: 'ACTIVE' as const,
  INACTIVE: 'INACTIVE' as const,
  DISCONTINUED: 'DISCONTINUED' as const,
  OUT_OF_STOCK: 'OUT_OF_STOCK' as const,
  LOW_STOCK: 'LOW_STOCK' as const,
};

const MovementType = {
  IN: 'IN' as const,
  OUT: 'OUT' as const,
  ADJUSTMENT: 'ADJUSTMENT' as const,
  RETURN: 'RETURN' as const,
};

// Componentes
import InventoryItemForm from "./ui/InventoryItemForm";
import ItemDetails from "./ui/ItemDetails";
import TablePagination from "../ui/table-pagination";

// Funciones auxiliares
const getStatusBadgeVariant = (status: string): BadgeProps["variant"] => {
  const statusMap: Record<string, BadgeProps["variant"]> = {
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

const convertInventoryItemToFormData = (
  item: InventoryItem
): InventoryFormItem => {
  const formItem: InventoryFormItem = {
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
    movements: item.movements.map((movement) => ({
      ...movement,
      date: new Date(movement.date),
    })),
  };
  return formItem;
};

export default function Medicine() {
  // Estados
  const [data, setData] = useState<InventoryFormItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    typeof InventoryStatus[keyof typeof InventoryStatus] | "all_statuses" | null
  >(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryFormItem | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definición de columnas
  const columns: ColumnDef<InventoryFormItem>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const isLowStock = ["LOW_STOCK", "OUT_OF_STOCK"].includes(
          row.original.status
        );
        const name = row.getValue("name");
        const presentation = row.original.presentation;
        const measure = row.original.measure;
        const activeCompound = row.original.activeCompound;

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
              setIsDialogOpen(true);
            }}
            className="flex items-center gap-2 hover:text-[#47b3b6] transition-colors"
          >
            <div className="text-left">
              <span className="font-medium block">{displayName}</span>
              {activeCompound && (
                <span className="text-sm text-gray-500 block">
                  {activeCompound}
                </span>
              )}
            </div>
            {isLowStock && (
              <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            )}
          </button>
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
        const status = row.getValue("status") as typeof InventoryStatus[keyof typeof InventoryStatus];
        const statusMap: Record<string, string> = {
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
      cell: ({ row }) =>
        formatDate(row.getValue("expirationDate") as string | null),
    },
    {
      accessorKey: "movements",
      header: "Último Movimiento",
      cell: ({ row }) => {
        const movements = row.original.movements;
        if (!movements?.length) return "-";

        const lastMovement = movements[0];
        return (
          <div className="text-sm">
            <span
              className={
                lastMovement.type === MovementType.IN
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {lastMovement.type === MovementType.IN ? "+" : "-"}
              {lastMovement.quantity}
            </span>
            <span className="text-gray-500 ml-2">
              {formatDate(lastMovement.date.toString())}
            </span>
            {lastMovement.user?.name && (
              <span className="text-gray-400 ml-1">
                                            por {lastMovement.user.name}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  // Cargar inventario
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const result: GetInventoryResponse = await getInventory();
      if (result.success && result.items) {
        // Filter only medicine items
        const medicineItems = result.items.filter(
          (item) => item.category === "MEDICINE"
        );
        setData(
          medicineItems.map((item) => convertInventoryItemToFormData(item))
        );
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch inventory",
        });
        setData([]);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handlers
  const handleEditSubmit = async (formData: InventoryItemFormData) => {
    if (!selectedItem) return;

    try {
      setIsSubmitting(true);

      const updateData: UpdateInventoryData = {
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
        category: "MEDICINE", // Always set category to MEDICINE
      };

      const result: UpdateInventoryResponse = await updateInventoryItem(
        selectedItem.id,
        updateData,
        "system"
      );

      if (!result.success) {
        if (result.requiresAuth) {
          const currentPath = window.location.pathname;
          const pendingUpdate = {
            itemId: selectedItem.id,
            updateData,
            returnTo: currentPath,
          };

          sessionStorage.setItem(
            "pendingInventoryUpdate",
            JSON.stringify(pendingUpdate)
          );

          const returnUrl = encodeURIComponent(
            `${window.location.origin}${currentPath}`
          );
          window.location.href = `/api/auth/login?returnTo=${returnUrl}`;
          return;
        }

        throw new Error(result.error || "Error al actualizar item");
      }

      setIsEditFormOpen(false);
      setIsDialogOpen(false);
      await fetchInventory();

      toast({
        title: "Éxito",
        description: "Medicamento actualizado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description:
          error instanceof Error
            ? error.message
            : "Error inesperado al actualizar el medicamento",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewItemSubmit = async (formData: InventoryItemFormData) => {
    setIsSubmitting(true);
    try {
      // Force category to be MEDICINE
      const medicineFormData: InventoryItemFormData = {
        ...formData,
        category: "MEDICINE",
      };

      const response: CreateInventoryResponse = await createInventoryItem(
        medicineFormData,
        "Creación inicial"
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      setIsNewItemFormOpen(false);
      await fetchInventory();

      toast({
        title: "Éxito",
        description: "Medicamento creado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al crear el medicamento",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cargar inventario inicial
  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Manejar actualizaciones pendientes
  React.useEffect(() => {
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const processPendingUpdate = async () => {
      const pendingUpdateStr = sessionStorage.getItem("pendingInventoryUpdate");
      if (!pendingUpdateStr) return;

      try {
        const pendingUpdate = JSON.parse(pendingUpdateStr);
        const result: UpdateInventoryResponse = await updateInventoryItem(
          pendingUpdate.itemId,
          pendingUpdate.updateData,
          "system"
        );

        if (!result.success) {
          if (result.requiresAuth && retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(processPendingUpdate, 1000);
            return;
          }
          throw new Error(
            result.error || "Error al procesar actualización pendiente"
          );
        }

        sessionStorage.removeItem("pendingInventoryUpdate");
        await fetchInventory();
        toast({
          title: "Éxito",
          description: "Medicamento actualizado correctamente",
        });
      } catch (error) {
        console.error("[processPendingUpdate] Error:", error);
        if (retryCount >= MAX_RETRIES) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "Error procesando actualización pendiente. Por favor, intente nuevamente.",
          });
          sessionStorage.removeItem("pendingInventoryUpdate");
        }
      }
    };

    const timeoutId = setTimeout(processPendingUpdate, 1000);
    return () => clearTimeout(timeoutId);
  }, [fetchInventory]);

  // Filtrar datos
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesStatus =
        !statusFilter ||
        statusFilter === "all_statuses" ||
        item.status === statusFilter;
      return matchesStatus;
    });
  }, [data, statusFilter]);

  // Configurar tabla
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
      const searchableColumns = ["name", "activeCompound", "location"];

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
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header y Filtros */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-[#47b3b6]" />
              </div>
              <Input
                placeholder="Buscar medicamento..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter || "all_statuses"}
                onValueChange={(value: typeof InventoryStatus[keyof typeof InventoryStatus] | "all_statuses") => {
                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="min-w-[200px] w-full max-w-[220px] h-10">
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
              <Button
                variant="outline"
                size="default"
                className="h-10 border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                onClick={() => setIsNewItemFormOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Nuevo medicamento</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Contenedor de tabla con altura fija */}
        <div className="flex flex-col">
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
          <div className="mt-4">
            <TablePagination
              currentPage={table.getState().pagination.pageIndex + 1}
              pageSize={table.getState().pagination.pageSize}
              totalItems={table.getFilteredRowModel().rows.length}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              onPageSizeChange={(size) => table.setPageSize(size)}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Modal de Detalles */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Medicamento</DialogTitle>
          <DialogDescription>
            Información detallada y movimientos del medicamento seleccionado.
          </DialogDescription>
        </DialogHeader>
        <ItemDetails selectedItem={selectedItem} />
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
      initialData={selectedItem}
      onSubmit={handleEditSubmit}
      isSubmitting={isSubmitting}
      category="MEDICINE"
    />

    {/* Formulario de Nuevo Item */}
    <InventoryItemForm
      open={isNewItemFormOpen}
      onOpenChange={setIsNewItemFormOpen}
      initialData={null}
      onSubmit={handleNewItemSubmit}
      isSubmitting={isSubmitting}
      category="MEDICINE"
    />
  </Card>
);
}