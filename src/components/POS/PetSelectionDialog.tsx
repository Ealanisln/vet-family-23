import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pet, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface PetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pet: Pet | null) => void;
  selectedClient: User | null;
}

export function PetSelectionDialog({
  open,
  onOpenChange,
  onSelect,
  selectedClient,
}: PetSelectionDialogProps) {
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Cargar mascotas del cliente cuando el diálogo se abre
  React.useEffect(() => {
    const loadPets = async () => {
      if (!selectedClient) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/${selectedClient.id}/pets`);
        const data = await response.json();
        if (data.success) {
          setPets(data.pets);
        }
      } catch (error) {
        console.error("Error cargando mascotas:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && selectedClient) {
      loadPets();
    }
  }, [open, selectedClient]);

  // Función para continuar sin mascota
  const handleContinueWithoutPet = () => {
    onSelect(null);
    onOpenChange(false);
  };

  if (!selectedClient) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Seleccionar Mascota</DialogTitle>
          <DialogDescription>
            Selecciona la mascota para la venta o continúa sin mascota
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Cliente seleccionado:</h4>
            <p className="text-sm text-gray-600">
              {selectedClient.firstName} {selectedClient.lastName}
            </p>
          </div>

          {/* Tabla de mascotas */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                        <span className="ml-2">Cargando mascotas...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      El cliente no tiene mascotas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  pets.map((pet) => (
                    <TableRow key={pet.id}>
                      <TableCell className="font-medium">
                        {pet.name}
                        {pet.isDeceased && (
                          <Badge variant="destructive" className="ml-2">
                            Fallecido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{pet.species}</TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            onSelect(pet);
                            onOpenChange(false);
                          }}
                          disabled={pet.isDeceased}
                          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
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
            onClick={handleContinueWithoutPet}
            className="flex-1 sm:flex-none"
          >
            Continuar sin Mascota
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