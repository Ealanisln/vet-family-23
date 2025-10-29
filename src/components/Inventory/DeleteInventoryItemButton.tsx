"use client";

import React, { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { softDeleteInventoryItem } from "@/app/actions/inventory";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DeleteInventoryItemButtonProps {
  itemId: string;
  itemName: string;
  userId: string; // User ID who is performing the deletion
  onDeleteSuccess?: () => void; // Callback to close parent dialog
}

export function DeleteInventoryItemButton({
  itemId,
  itemName,
  userId,
  onDeleteSuccess,
}: DeleteInventoryItemButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!deletionReason.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una razón para la eliminación.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await softDeleteInventoryItem(
        itemId,
        userId,
        deletionReason.trim()
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Show warning if item has linked orders
      if (result.warning) {
        toast({
          title: "Advertencia",
          description: result.warning,
          variant: "default",
        });
      }

      toast({
        title: "Éxito",
        description: "El item ha sido eliminado correctamente.",
      });

      setOpen(false);
      setDeletionReason("");

      // Call the callback to close parent dialog
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }

      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar el item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará <strong>{itemName}</strong> del inventario.
              <br />
              <br />
              El item se moverá a la sección de eliminados y podrás restaurarlo
              más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="deletion-reason">
              Razón de la eliminación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deletion-reason"
              placeholder="Ej: Producto descontinuado, Expirado, Error de registro..."
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              disabled={isDeleting}
              className="w-full"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeletionReason("")}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || !deletionReason.trim()}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
