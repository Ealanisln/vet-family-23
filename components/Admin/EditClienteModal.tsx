"use client";

import { useState } from "react";
import { ICliente } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EditClienteModalProps {
  cliente: ICliente;
  onClose: () => void;
  onSave: (updatedData: Partial<ICliente>) => void;
}

export function EditClienteModal({ cliente, onClose, onSave }: EditClienteModalProps) {
  const [editedCliente, setEditedCliente] = useState<ICliente>(cliente);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setEditedCliente((prev) => ({ ...prev, proximaVisitaGratis: checked }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(editedCliente);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={editedCliente.nombre}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mascota" className="text-right">
                Mascota
              </Label>
              <Input
                id="mascota"
                name="mascota"
                value={editedCliente.mascota}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visitas" className="text-right">
                Visitas
              </Label>
              <Input
                id="visitas"
                name="visitas"
                type="number"
                value={editedCliente.visitas}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ultimaVisita" className="text-right">
                Última Visita
              </Label>
              <Input
                id="ultimaVisita"
                name="ultimaVisita"
                type="date"
                value={editedCliente.ultimaVisita ? new Date(editedCliente.ultimaVisita).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center space-x-2">
             
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}