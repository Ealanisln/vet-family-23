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
import { Pet } from "@/types/pet";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { PawPrint, UserCheck, Loader2, Heart, Dog } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] bg-white/95 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <PawPrint className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Seleccionar Mascota
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Selecciona la mascota para la venta o continúa sin mascota
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del cliente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-800">Cliente seleccionado:</h4>
            </div>
            <p className="text-sm text-blue-700 font-medium">
              {selectedClient.firstName} {selectedClient.lastName}
            </p>
          </div>

          {/* Tabla de mascotas */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-700">Nombre</TableHead>
                  <TableHead className="font-medium text-gray-700">Especie</TableHead>
                  <TableHead className="font-medium text-gray-700">Raza</TableHead>
                  <TableHead className="text-right font-medium text-gray-700">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        <span className="text-gray-600">Cargando mascotas...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Dog className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-600">
                          El cliente no tiene mascotas registradas
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pets.map((pet) => (
                    <TableRow key={pet.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-4 w-4 text-blue-600" />
                          <span>{pet.name}</span>
                          {pet.isDeceased && (
                            <Badge variant="destructive" className="ml-2 flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              Fallecido
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{pet.species}</TableCell>
                      <TableCell className="text-gray-600">{pet.breed}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            onSelect(pet);
                            onOpenChange(false);
                          }}
                          disabled={pet.isDeceased}
                          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
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

        <DialogFooter className="flex justify-between sm:justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleContinueWithoutPet}
            className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50"
          >
            Continuar sin Mascota
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 