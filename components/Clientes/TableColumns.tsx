// components/TableColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/types/user";
import { formatPhoneNumber } from "@/utils/format";
import Link from "next/link";
import Actions from "./ClientActions";

export const createColumns = (
  handleDeleteUser: (userId: string) => Promise<void>
): ColumnDef<User>[] => [
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
    cell: ({ row }) => (
      <Actions user={row.original} onDelete={handleDeleteUser} />
    ),
  },
];
