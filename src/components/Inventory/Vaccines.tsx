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
import { getInventory, updateInventoryItem } from "@/app/actions/inventory";
import { toast } from "@/components/ui/use-toast";
import { UpdateInventoryData } from "@/types/inventory";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number | null;
  status: string;
  expirationDate: string | null;
  location: string | null;
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  movements: Array<{
    type: string;
    quantity: number;
    date: string;
    user: {
      name: string | null;
    } | null;
  }>;
}

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

export default function VaccineInventory() {
  const [data, setData] = React.useState<InventoryItem[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
        // Filter only vaccines when setting the initial data
        const vaccineItems = result.items.filter(
          (item) => item.category === "VACCINE"
        );
        setData(vaccineItems);
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
      const result = await updateInventoryItem(id, newData, "Manual update");

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente",
        });
        fetchInventory();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al actualizar item",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error inesperado al actualizar",
      });
    }
  };

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
      const searchableColumns = ["name", "location"];

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
                placeholder="Buscar vacunas..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter || "all_statuses"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all_statuses" ? null : value)
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

              <Button
                variant="outline"
                size="icon"
                className="border-[#47b3b6]/20 hover:bg-[#47b3b6]/10 hover:text-[#47b3b6]"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
                      <p className="mt-2 text-gray-600">Cargando vacunas...</p>
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

        {/* Paginación */}
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

      {/* Modal de Detalles */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Vacuna</DialogTitle>
            <DialogDescription>
              Información detallada y movimientos de la vacuna seleccionada.
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
                  // Aquí iría la lógica para editar la vacuna
                  setIsDialogOpen(false);
                }}
                className="bg-[#47b3b6] hover:bg-[#47b3b6]/90 text-white"
              >
                Editar Vacuna
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
