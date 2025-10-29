"use client";

import React, { useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
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
import { restoreInventoryItem } from "@/app/actions/inventory";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface RestoreInventoryItemButtonProps {
  itemId: string;
  itemName: string;
}

export function RestoreInventoryItemButton({
  itemId,
  itemName,
}: RestoreInventoryItemButtonProps) {
  const [open, setOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restoreInventoryItem(itemId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Éxito",
        description: "El item ha sido restaurado correctamente.",
      });

      setOpen(false);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error restoring inventory item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo restaurar el item",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        disabled={isRestoring}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Restaurar
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar item</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas restaurar <strong>{itemName}</strong> al inventario
              activo?
              <br />
              <br />
              El item volverá a estar disponible para su uso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={isRestoring}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                "Restaurar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
