"use client";

import * as React from "react";
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
import { Badge, type BadgeProps } from "@/components/ui/custom-badge";
import { getInventory } from "@/app/actions/inventory";

interface MedicineItem {
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
  status: 'ACTIVE' | 'INACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  batchNumber: string | null;
  specialNotes: string | null;
  movements: {
    date: string;
    user: {
      name: string | null;
    };
  }[];
}

interface FetchMedicineResult {
  success: boolean;
  items?: MedicineItem[];
  error?: string;
}

const getStatusBadgeVariant = (status: MedicineItem['status']): BadgeProps['variant'] => {
  const statusMap: Record<MedicineItem['status'], BadgeProps['variant']> = {
    ACTIVE: "success",
    INACTIVE: "secondary",
    LOW_STOCK: "warning",
    OUT_OF_STOCK: "destructive",
    EXPIRED: "destructive"
  };
  return statusMap[status];
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const columns: ColumnDef<MedicineItem>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const isLowStock = row.original.status === 'LOW_STOCK' || row.original.status === 'OUT_OF_STOCK';
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.getValue("name")}</span>
          {isLowStock && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
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
      const status = row.getValue("status") as MedicineItem['status'];
      const statusMap: Record<MedicineItem['status'], string> = {
        ACTIVE: "Activo",
        INACTIVE: "Inactivo",
        LOW_STOCK: "Stock Bajo",
        OUT_OF_STOCK: "Sin Stock",
        EXPIRED: "Expirado"
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
    cell: ({ row }) => formatDate(row.getValue("expirationDate") as string | null),
  },
  {
    accessorKey: "batchNumber",
    header: "Número de Lote",
    cell: ({ row }) => row.getValue("batchNumber") || "-",
  },
];

export default function MedicineInventory() {
  const [data, setData] = React.useState<MedicineItem[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    async function fetchMedicines() {
      try {
        setLoading(true);
        setError(null);
        const result = await getInventory();
        if (result.success && result.items) {
          setData(result.items);
        } else {
          setError(result.error || 'Failed to fetch medicines');
          setData([]);
        }
      } catch (error) {
        setError('An unexpected error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMedicines();
  }, []);

  const filteredData = React.useMemo(() => {
    return data.filter(item => {
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
      const searchableColumns = ["name", "activeCompound", "presentation", "location", "batchNumber"];
      
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
                onValueChange={(value) => setStatusFilter(value === "all_statuses" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
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
    </Card>
  );
}