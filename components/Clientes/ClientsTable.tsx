"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
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
import { getUsers } from "@/app/actions/get-customers";
import Loader from "@/components/ui/loader";
import Actions from './ClientActions';

export interface User {
  id: string;
  internalId: string | null;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
  pet: string | null;
  visits: number;
  nextVisitFree: boolean;
  lastVisit: Date | null;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

async function renewKindeToken() {
  try {
    const response = await fetch('/api/kinde-token');
    if (!response.ok) {
      throw new Error(`Failed to renew Kinde token: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Renewed Kinde token:', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Error renewing Kinde token:', error);
    throw error;
  }
}

export default function ClientsTable() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const { toast } = useToast();

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      console.log(`Attempting to delete user with ID: ${userId}`);
      try {
        let token = await renewKindeToken();
        console.log('Using token for delete request:', token);
        
        const response = await fetch(`/api/user/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ userId, isDeleteProfile: true }),
        });
  
        console.log('Delete request response:', response.status, await response.text());
  
        if (response.status === 401) {
          console.log('Received 401, attempting to renew token and retry');
          token = await renewKindeToken();
          console.log('Using renewed token for retry:', token);
          const retryResponse = await fetch(`/api/user/delete`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId, isDeleteProfile: true }),
          });
  
          console.log('Retry response:', retryResponse.status, await retryResponse.text());
  
          if (!retryResponse.ok) {
            throw new Error(`Failed to delete user: ${retryResponse.statusText}`);
          }
        } else if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.statusText}`);
        }
  
        console.log(`User with ID ${userId} deleted successfully`);
        setData((prevData) => prevData.filter((user) => user.id !== userId));
        toast({
          title: "Éxito",
          description: "Usuario eliminado exitosamente.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error al eliminar el usuario.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );
  
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "Nombre",
        cell: ({ row }) => {
          const firstName = row.getValue("firstName") as string | null;
          const lastName = row.original.lastName as string | null;
          const fullName = [firstName, lastName].filter(Boolean).join(" ");
          return (
            <Link
              href={`/admin/clientes/${row.original.id}`}
              className="hover:underline"
            >
              <div className="capitalize">
                {fullName || row.original.name || "N/A"}
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Correo",
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email") || "N/A"}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Teléfono",
        cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          console.log(`Rendering Actions for user: ${row.original.id}`);
          return (
            <Actions
              user={row.original}
              onDelete={handleDeleteUser}
            />
          );
        },
      },
    ],
    [handleDeleteUser]
  );

  const table = useReactTable({
    data,
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
    },
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const token = await renewKindeToken();
        const users = await getUsers(token);
        const transformedUsers: User[] = users.map((user: any) => ({
          id: user.id,
          internalId: user.internalId || null,
          kindeId: user.kindeId,
          email: user.email || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          name: user.name || null,
          phone: user.phone || null,
          address: user.address || null,
          preferredContactMethod: user.preferredContactMethod || null,
          pet: user.pet || null,
          visits: user.visits || 0,
          nextVisitFree: user.nextVisitFree || false,
          lastVisit: user.lastVisit ? new Date(user.lastVisit) : null,
          roles: user.roles || [],
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        }));
        setData(transformedUsers);
        console.log(`Fetched ${transformedUsers.length} users`);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const rowCount = table.getRowModel().rows.length;
  useEffect(() => {
    console.log(`Table data updated. Current row count: ${rowCount}`);
  }, [rowCount]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader size={32} className="mx-auto" />
                  <p className="mt-2">Cargando resultados...</p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
