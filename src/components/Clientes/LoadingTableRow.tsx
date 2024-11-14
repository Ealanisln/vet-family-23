// components/LoadingTableRow.tsx
import { TableRow, TableCell } from "@/components/ui/table";
import Loader from "@/components/ui/loader";

interface LoadingTableRowProps {
  colSpan: number;
}

export const LoadingTableRow = ({ colSpan }: LoadingTableRowProps) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="h-24 text-center">
      <Loader size={32} className="mx-auto" />
      <p className="mt-2">Cargando resultados...</p>
    </TableCell>
  </TableRow>
);
