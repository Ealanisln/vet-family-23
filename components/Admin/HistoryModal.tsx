import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ICliente } from "@/types"; // Make sure to import ICliente from wherever it's defined
import { format } from "date-fns"; // Don't forget to import format if you're using it

interface VisitHistoryModalProps {
  cliente: ICliente;
  onClose: () => void;
}

function VisitHistoryModal({ cliente, onClose }: VisitHistoryModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historial de Visitas - {cliente.mascota}</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Gratis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cliente.historialVisitas.map((visita, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(visita.fecha), "dd/MM/yyyy")}</TableCell>
                <TableCell>{visita.costo}</TableCell>
                <TableCell>{visita.esGratis ? "Sí" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}

export default VisitHistoryModal;