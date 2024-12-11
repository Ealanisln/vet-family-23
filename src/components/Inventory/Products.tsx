//components/Inventory/Products.tsx

"use client";

import * as React from "react";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/ui/loader";
import { Badge, BadgeProps } from "@/components/ui/custom-badge";
import {
  createInventoryItem,
  getInventory,
  updateInventoryItem,
} from "@/app/actions/inventory";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  InventoryItem,
  InventoryItemFormData,
  UpdateInventoryData,
} from "./types";
import InventoryItemForm from "./ui/InventoryItemForm";
import { useState } from "react";

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

export default function Inventory() {
  const [data, setData] = React.useState<InventoryItem[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const isLowStock = ["LOW_STOCK", "OUT_OF_STOCK"].includes(
          row.original.status
        );
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
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const categoryMap: Record<string, string> = {
          MEDICINE: "Medicina",
          SURGICAL_MATERIAL: "Material Quirúrgico",
          VACCINE: "Vacuna",
          FOOD: "Alimento",
          ACCESSORY: "Accesorio",
          CONSUMABLE: "Consumible",
        };
        return <div>{categoryMap[row.original.category]}</div>;
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
        const status = row.getValue("status") as string;
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
                lastMovement.type === "IN" ? "text-green-600" : "text-red-600"
              }
            >
              {lastMovement.type === "IN" ? "+" : "-"}
              {lastMovement.quantity}
            </span>
            <span className="text-gray-500 ml-2">
              {formatDate(lastMovement.date)}
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

  const fetchInventory = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getInventory();
      if (result.success && result.items) {
        setData(result.items);
      } else {
        setError(result.error || "Failed to fetch inventory");
        setData([]);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpdateItem = async (id: string, newData: UpdateInventoryData) => {
    try {
      const result = await updateInventoryItem(
        id,
        newData,
        "current-user-id",
        "Manual update"
      );

      if (!result.success) {
        // Check if it's an auth error
        if (result.requiresAuth) {
          // Use Kinde's login function
          window.location.href = "/api/auth/login";
          return;
        }

        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al actualizar item",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      });
      fetchInventory();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error inesperado al actualizar",
      });
    }
  };

  const handleEditSubmit = async (formData: InventoryItemFormData) => {
    if (!selectedItem) return;

    try {
      // Convertir los datos del formulario al formato esperado por UpdateInventoryData
      const updateData: UpdateInventoryData = {
        quantity: formData.quantity,
        minStock: formData.minStock || undefined,
        location: formData.location || undefined,
        status: selectedItem.status, // Mantener el status actual
      };

      await handleUpdateItem(selectedItem.id, updateData);

      setIsEditFormOpen(false);
      setIsDialogOpen(false);
      await fetchInventory(); // Recargar datos

      toast({
        title: "Éxito",
        description: "Item actualizado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el item",
      });
    }
  };

  const handleNewItemSubmit = async (formData: InventoryItemFormData) => {
    setIsSubmitting(true);
    try {
      const response = await createInventoryItem(formData, "Creación inicial");

      if (!response.success) {
        throw new Error(response.error);
      }

      setIsNewItemFormOpen(false);

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

  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [data, categoryFilter, statusFilter]);

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
                placeholder="Buscar en inventario..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={categoryFilter || "all_categories"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all_categories" ? null : value)
                }
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_categories">
                    Todas las categorías
                  </SelectItem>
                  <SelectItem value="MEDICINE">Medicina</SelectItem>
                  <SelectItem value="SURGICAL_MATERIAL">
                    Material Quirúrgico
                  </SelectItem>
                  <SelectItem value="VACCINE">Vacuna</SelectItem>
                  <SelectItem value="FOOD">Alimento</SelectItem>
                  <SelectItem value="ACCESSORY">Accesorio</SelectItem>
                  <SelectItem value="CONSUMABLE">Consumible</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter || "all_statuses"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all_statuses" ? null : value)
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

              <Button
                variant="outline"
                size="default"
                className="h-10 border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                onClick={() => setIsNewItemFormOpen(true)} // Agregar este onClick
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Nuevo registro</span>
              </Button>
            </div>
          </div>
        </div>

        <InventoryItemForm
          open={isNewItemFormOpen}
          onOpenChange={setIsNewItemFormOpen}
          initialData={null}
          onSubmit={handleNewItemSubmit}
          isSubmitting={isSubmitting}
        />

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
                        Cargando inventario...
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
                      No se encontraron items en el inventario.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} items encontrados
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

      {/* Modal de Detalles */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Item</DialogTitle>
            <DialogDescription>
              Información detallada y movimientos del item seleccionado.
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
                Editar Item
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
        isSubmitting={false} // Puedes añadir un estado para controlar esto si lo deseas
      />
    </Card>
  );
}
