import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { User } from "@prisma/client";

interface ClientSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (client: User | null) => void;
}

export function ClientSelectionDialog({
  open,
  onOpenChange,
  onSelect,
}: ClientSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para buscar clientes
  const searchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/search?q=${searchTerm}`);
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error("Error buscando clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar venta al público
  const handlePublicSale = () => {
    onSelect(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Cliente</DialogTitle>
          <DialogDescription>
            Busca y selecciona un cliente o realiza una venta al público
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre, teléfono o email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchClients()}
              />
            </div>
            <Button onClick={searchClients} disabled={loading}>
              Buscar
            </Button>
          </div>

          {/* Tabla de resultados */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                        <span className="ml-2">Buscando...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {searchTerm
                        ? "No se encontraron clientes"
                        : "Busca un cliente para comenzar"}
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        {client.firstName} {client.lastName}
                      </TableCell>
                      <TableCell>{client.phone || "N/A"}</TableCell>
                      <TableCell>{client.email || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            onSelect(client);
                            onOpenChange(false);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={handlePublicSale}
            className="flex-1 sm:flex-none"
          >
            Venta al Público
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 