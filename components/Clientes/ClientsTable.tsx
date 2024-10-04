"use client"

import * as React from "react"
import Link from "next/link"
import {
  LucideCircleEllipsis,
  Plus,
  Trash2
} from "lucide-react"
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
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUser, deleteUser } from "@/app/actions/new/user"
import { toast } from "@/components/ui/use-toast"

// Update the User type to match your Prisma schema
export type User = {
  id: string
  kindeId: string
  email: string
  firstName: string | null
  lastName: string | null
  name: string | null
  phone: string | null
  address: string | null
  preferredContactMethod: string | null
  pet: string | null
  visits: number
  nextVisitFree: boolean
  lastVisit: Date | null
  createdAt: Date
  updatedAt: Date
}


export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "Nombre",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string | null
      const lastName = row.original.lastName as string | null
      const fullName = [firstName, lastName].filter(Boolean).join(" ")
      return <Link href={`/admin/clientes/${row.original.id}`} className="hover:underline">
        <div className="capitalize">{fullName || "N/A"}</div>
      </Link>
    },
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original

      const handleDelete = async () => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}?`)) {
          const result = await deleteUser(user.id)
          if (result.success) {
            toast({
              title: "Usuario eliminado",
              description: `${user.firstName} ${user.lastName} ha sido eliminado exitosamente.`,
            })
            // Refresh the table data here
          } else {
            toast({
              title: "Error",
              description: "No se pudo eliminar el usuario. Por favor, inténtalo de nuevo.",
              variant: "destructive",
            })
          }
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <LucideCircleEllipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copiar ID del usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/admin/clientes/${user.id}`}>Ver detalles</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/clientes/${user.id}/edit`}>Editar usuario</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar usuario</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function ClientsTable() {
  const [data, setData] = React.useState<User[]>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const usersPromises = Array.from({ length: 10 }, async (_, i) => {
          const result = await getUser(`user${i + 1}`)
          return result.success && result.user ? result.user : null
        })

        const users = await Promise.all(usersPromises)
        setData(users.filter((user): user is User => user !== null))
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    }
    fetchUsers()
  }, [])

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
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filtrar por nombre..."
          value={(table.getColumn("firstName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("firstName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Link href="/admin/clientes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Crear Usuario
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
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
  )
}