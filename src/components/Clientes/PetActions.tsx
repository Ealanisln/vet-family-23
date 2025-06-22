// src/components/Clientes/PetActions.tsx

import * as React from "react";
import { MoreHorizontal, Eye, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { deletePet } from "@/app/actions/delete-pets";
import { archivePet } from "@/app/actions/archive-pet";
import { TablePet } from "@/types/pet"; // Import the shared type

interface PetActionsProps {
  pet: TablePet;
  onPetDeleted?: () => void;  
}

export default function PetActions({ pet, onPetDeleted }: PetActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);

  const handleDelete = async () => {
    if (!pet?.userId) {
      console.error("Pet data:", pet);
      toast({
        title: "Error",
        description: "Datos de usuario incompletos. Por favor, recarga la página.",
        variant: "destructive",
      });
      return;
    }
  
    setIsDeleting(true);
    try {
      const result = await deletePet(pet.userId, pet.id);
  
      if (result.success) {
        toast({
          title: "Mascota eliminada",
          description: `${pet.name} se ha eliminado correctamente`,
        });
        setShowDeleteDialog(false);
        onPetDeleted?.();  // Llamamos a la función de recarga
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo eliminar la mascota",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar eliminar la mascota",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!pet?.userId) {
      console.error("Pet data:", pet);
      toast({
        title: "Error",
        description: "Datos de usuario incompletos. Por favor, recarga la página.",
        variant: "destructive",
      });
      return;
    }

    setIsArchiving(true);
    try {
      const result = await archivePet(pet.userId, pet.id, !pet.isArchived);

      if (result.success) {
        toast({
          title: pet.isArchived ? "Mascota desarchivada" : "Mascota archivada",
          description: `${pet.name} se ha ${pet.isArchived ? 'desarchivado' : 'archivado'} correctamente`,
        });
        setShowArchiveDialog(false);
        onPetDeleted?.();  // Reutilizamos esta función para recargar la tabla
      } else {
        toast({
          title: "Error",
          description: result.error || `No se pudo ${pet.isArchived ? 'desarchivar' : 'archivar'} la mascota`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al archivar mascota:", error);
      toast({
        title: "Error",
        description: `Ocurrió un error al intentar ${pet.isArchived ? 'desarchivar' : 'archivar'} la mascota`,
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/admin/mascotas/${pet.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowArchiveDialog(true)}
            className={pet.isArchived ? "text-green-600" : "text-orange-600"}
          >
            {pet.isArchived ? (
              <ArchiveRestore className="mr-2 h-4 w-4" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            {pet.isArchived ? "Desarchivar mascota" : "Archivar mascota"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar mascota
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de eliminar a {pet.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {pet.name} y todos sus
              registros asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de {pet.isArchived ? 'desarchivar' : 'archivar'} a {pet.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pet.isArchived 
                ? `Esta acción hará que ${pet.name} vuelva a ser visible en la lista principal de mascotas.`
                : `Esta acción ocultará a ${pet.name} de la vista principal, pero mantendrá todos sus registros. Podrás revertir esta acción cuando lo desees.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              disabled={isArchiving}
            >
              Cancelar
            </Button>
            <Button
              variant={pet.isArchived ? "default" : "secondary"}
              onClick={handleArchive}
              disabled={isArchiving}
            >
              {isArchiving 
                ? (pet.isArchived ? "Desarchivando..." : "Archivando...") 
                : (pet.isArchived ? "Desarchivar" : "Archivar")
              }
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}