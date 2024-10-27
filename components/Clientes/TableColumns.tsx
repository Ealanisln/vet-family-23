import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { formatPhoneNumber } from "@/utils/format";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
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
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null;
      return <div>{formatPhoneNumber(phone)}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Actions user={row.original} onDelete={handleDeleteUser} />
    ),
  },
];