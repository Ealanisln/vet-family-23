// src/components/Deworming/DewormingDialog.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditIcon, PlusIcon } from 'lucide-react';
import { DewormingForm } from './DewormingForm';
import { PrismaDeworming } from './DewormingContainer';

interface DewormingDialogProps {
  petId: string;
  type: 'INTERNAL' | 'EXTERNAL';
  existingRecord?: PrismaDeworming;
}

export function DewormingDialog({ petId, type, existingRecord }: DewormingDialogProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingRecord ? "ghost" : "default"} size="sm">
          {existingRecord ? (
            <EditIcon className="h-4 w-4" />
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" />
              Agregar Registro
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingRecord
              ? "Editar Registro de Desparasitación"
              : "Nuevo Registro de Desparasitación"}
          </DialogTitle>
        </DialogHeader>
        <DewormingForm
          petId={petId}
          type={type}
          existingRecord={existingRecord}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
