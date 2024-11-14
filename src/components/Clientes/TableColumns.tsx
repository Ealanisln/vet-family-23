import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { formatPhoneNumber } from "@/utils/format";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Actions from "./ClientActions";

export const createColumns = (
  handleDeleteUser: (userId: string) => Promise<void>
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-semibold"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    sortingFn: (rowA, rowB) => {
      const a = [rowA.getValue("firstName"), rowA.original.lastName].filter(Boolean).join(" ").toLowerCase();
      const b = [rowB.getValue("firstName"), rowB.original.lastName].filter(Boolean).join(" ").toLowerCase();
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-semibold"
        >
          Correo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email") || "N/A"}</div>
    ),
    sortingFn: (rowA, rowB) => {
      const a = (rowA.getValue("email") as string || "").toLowerCase();
      const b = (rowB.getValue("email") as string || "").toLowerCase();
      return a.localeCompare(b);
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-semibold"
        >
          Teléfono
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return <div>{formatPhoneNumber(phone)}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const a = (rowA.getValue("phone") as string || "").replace(/\D/g, "");
      const b = (rowB.getValue("phone") as string || "").replace(/\D/g, "");
      return a.localeCompare(b);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Actions user={row.original} onDelete={handleDeleteUser} />
    ),
    enableSorting: false,
  },
];