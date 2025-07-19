// src/components/Inventory/Products.tsx

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { InventoryCategory } from "@/types/inventory";

// Componentes
import InventoryItemForm from "./ui/InventoryItemForm";
import ItemDetails from "./ui/ItemDetails";
import { CategoryFilter } from "./CategoryFilter";
import { CATEGORY_TRANSLATIONS } from "@/utils/category-translations";
import TablePagination from "../ui/table-pagination";

// Funciones auxiliares
const isNearExpiration = (expirationDate: string | null): boolean => {
  if (!expirationDate) return false;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiration = Math.ceil(
    (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiration > 0 && daysUntilExpiration <= 30;
};

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

export default function Inventory() {
  // Estados
  const [data, setData] = useState<InventoryFormItem[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<
    InventoryCategory | "all_categories" | null
  >(null);
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Nombre
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        const isLowStock = ["LOW_STOCK", "OUT_OF_STOCK"].includes(
          row.original.status
        );
        const name = row.getValue("name");
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
              setIsDialogOpen(true);
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
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Categoría
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          {CATEGORY_TRANSLATIONS[row.original.category] ||
            row.original.category}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Cantidad
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("quantity")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Estado
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Fecha de Expiración
            {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        const expirationDate = row.getValue("expirationDate") as string | null;
        const isExpiringSoon = isNearExpiration(expirationDate);
        return (
          <div className="flex items-center gap-2">
            <span>{formatDate(expirationDate)}</span>
            {isExpiringSoon && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "movements",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:text-[#47b3b6] transition-colors"
          >
            Último Movimiento
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
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
        setData(
          result.items.map((item) => convertInventoryItemToFormData(item))
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
        category: formData.category,
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

  const handleNewItemSubmit = async (formData: InventoryItemFormData) => {
    setIsSubmitting(true);
    try {
      const response: CreateInventoryResponse = await createInventoryItem(
        formData,
        "Creación inicial"
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      setIsNewItemFormOpen(false);
      await fetchInventory();

      toast({
        title: "Éxito",
        description: "Item creado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear el item",
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
          description: "Item actualizado correctamente",
        });
      } catch (error) {
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

  // Cargar inventario inicial
  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Filtrar datos
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesCategory =
        !categoryFilter ||
        categoryFilter === "all_categories" ||
        item.category === categoryFilter;
      const matchesStatus =
        !statusFilter ||
        statusFilter === "all_statuses" ||
        item.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [data, categoryFilter, statusFilter]);

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
      const searchableColumns = ["name", "category", "location"];

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
                  placeholder="Buscar en inventario..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
                />
              </div>
              <div className="flex gap-2">
                <CategoryFilter
                  value={categoryFilter || "all_categories"}
                  onChange={(value) => setCategoryFilter(value)}
                />

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
                  <p>Nuevo registro</p>
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
                            Cargando inventario...
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className={`
                          hover:bg-[#47b3b6]/5 
                          transition-colors 
                          duration-200
                          ${
                            isNearExpiration(row.original.expirationDate as string)
                              ? "bg-orange-100"
                              : ""
                          }
                        `}
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
                          No se encontraron items en el inventario.
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

      {/* Mantener los modales y diálogos existentes */}
      <InventoryItemForm
        open={isNewItemFormOpen}
        onOpenChange={setIsNewItemFormOpen}
        initialData={null}
        onSubmit={handleNewItemSubmit}
        isSubmitting={isSubmitting}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Item</DialogTitle>
            <DialogDescription>
              Información detallada y movimientos del item seleccionado.
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
                Editar Item
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InventoryItemForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        initialData={selectedItem}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
      />
    </Card>
  );
}