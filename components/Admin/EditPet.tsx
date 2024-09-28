"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditIcon } from "lucide-react";
import PetForm from '@/components/Admin/ui/PetForm'; // Adjust the import path as needed

interface MedicalHistory {
  id: string;
  petId: string;
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes: string | null;
}

interface Vaccination {
  id: string;
  petId: string;
  vaccineType: string;
  administrationDate: Date;
  nextDoseDate: Date;
}

interface EditPetDialogProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    gender: string;
    weight: number;
    microchipNumber: string | null;
    medicalHistory: MedicalHistory[];
    vaccinations: Vaccination[];
  };
}

export function EditPetDialog({ pet }: EditPetDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const formatPetForForm = (pet: EditPetDialogProps['pet']) => {
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth.toISOString().split('T')[0],
      gender: pet.gender,
      weight: pet.weight.toString(),
      microchipNumber: pet.microchipNumber || undefined,
      medicalHistory: pet.medicalHistory.length > 0 ? pet.medicalHistory[0].notes || '' : '',
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <EditIcon className="mr-2 h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Mascota</DialogTitle>
          <DialogDescription>
            Realiza cambios en la información de la mascota aquí. Haz clic en guardar cuando hayas terminado.
          </DialogDescription>
        </DialogHeader>
       
      </DialogContent>
    </Dialog>
  );
}