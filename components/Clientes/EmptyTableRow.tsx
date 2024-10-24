// components/EmptyTableRow.tsx
import { TableRow, TableCell } from "@/components/ui/table";

interface EmptyTableRowProps {
  colSpan: number;
}

export const EmptyTableRow = ({ colSpan }: EmptyTableRowProps) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="h-24 text-center">
      No se encontraron resultados.
    </TableCell>
  </TableRow>
);
