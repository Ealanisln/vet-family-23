"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
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
import { getPets } from "@/app/actions/get-pets";
import Loader from "@/components/ui/loader";
import { Checkbox } from "../ui/checkbox";
import PetActions from "./PetActions";

interface TablePet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  isDeceased: boolean;
}

export const columns: ColumnDef<TablePet>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <Link
        href={`/admin/mascotas/${row.original.id}`}
        className="hover:underline text-[#47b3b6] font-medium"
      >
        <div className="capitalize">{row.getValue("name")}</div>
      </Link>
    ),
  },
  {
    accessorKey: "species",
    header: "Especie",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("species")}</div>
    ),
  },
  {
    accessorKey: "breed",
    header: "Raza",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("breed")}</div>
    ),
  },
  {
    accessorKey: "ownerName",
    header: "Dueño",
    cell: ({ row }) => <div>{row.getValue("ownerName")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const pet = row.original;
      return <PetActions pet={pet} />;
    },
  },
];

export default function PetsTable() {
  const [data, setData] = React.useState<TablePet[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [showDeceased, setShowDeceased] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState("");

  React.useEffect(() => {
    async function fetchPets() {
      try {
        setLoading(true);
        const result = await getPets();
        if (result.success) {
          const tablePets = result.pets.map(pet => ({
            id: pet.id,
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            ownerName: pet.ownerName,
            isDeceased: pet.isDeceased,
          }));
          setData(tablePets);
        } else {
          console.error("Failed to fetch pets:", result.error);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPets();
  }, []);

  const filteredData = React.useMemo(() => {
    return showDeceased ? data : data.filter(pet => !pet.isDeceased);
  }, [data, showDeceased]);

  const handleSearch = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const searchableColumns = ["name", "species", "breed", "ownerName"];
      
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
        {/* Header y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-auto sm:flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 text-[#47b3b6]" />
            </div>
            <Input
              placeholder="Buscar mascotas..."
              value={globalFilter}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-full border-[#47b3b6]/20 focus:border-[#47b3b6]/50 bg-white rounded-xl h-11"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-deceased"
              checked={showDeceased}
              onCheckedChange={(checked) => setShowDeceased(checked as boolean)}
              className="border-[#47b3b6]/20 data-[state=checked]:bg-[#47b3b6]"
            />
            <label htmlFor="show-deceased" className="text-gray-600">
              Mostrar mascotas fallecidas
            </label>
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
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-24 text-center"
                    >
                      <Loader size={32} className="mx-auto text-[#47b3b6]" />
                      <p className="mt-2 text-gray-600">Cargando mascotas...</p>
                    </TableCell>
                  </TableRow>
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
                  <TableRow>
                    <TableCell 
                      colSpan={columns.length} 
                      className="h-24 text-center text-gray-600"
                    >
                      No se encontraron mascotas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer con paginación */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 pt-6">
          <div className="w-full sm:w-auto text-sm text-[#47b3b6] order-2 sm:order-1">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} mascota(s) seleccionada(s).
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