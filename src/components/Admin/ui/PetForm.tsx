"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, Calendar, Pencil } from "lucide-react";
import { addPet, updatePet } from "@/app/actions/add-edit-pet";
import { Checkbox } from "@/components/ui/checkbox";

interface PetFormProps {
  isEditing?: boolean;
  initialPet?: Pet | null;
  onClose?: () => void;
  userId?: string;
}

interface Pet {
  id?: string;
  userId?: string;
  internalId?: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  weight: string;
  isNeutered: boolean;
  microchipNumber?: string;
  medicalHistory?: string;
}

const PetForm: React.FC<PetFormProps> = ({
  isEditing = false,
  initialPet = null,
  onClose,
  userId,
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pet, setPet] = useState<Pet>({
    internalId: "",
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    weight: "",
    gender: "",
    isNeutered: false,
    microchipNumber: "",
    medicalHistory: "",
  });

  useEffect(() => {
    if (isEditing && initialPet) {
      setPet(initialPet);
    }
  }, [isEditing, initialPet]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setPet((prevState) => ({ ...prevState, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveUserId = userId || (Array.isArray(params.id) ? params.id[0] : params.id);
    
    if (!effectiveUserId) {
      console.error("No user ID available");
      return;
    }

    const petData = {
      ...pet,
      internalId: pet.internalId || undefined,
      dateOfBirth: new Date(pet.dateOfBirth),
      weight: parseFloat(pet.weight),
      isNeutered: pet.isNeutered,
    };

    let result;
    if (isEditing && pet.id) {
      result = await updatePet(effectiveUserId, pet.id, petData);
    } else {
      result = await addPet(effectiveUserId, petData);
    }

    if (result.success) {
      setOpen(false);
      if (onClose) onClose();
      router.refresh();
    } else {
      console.error(result.error);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="internalId" className="text-sm font-medium text-gray-700">
            ID Interno
          </Label>
          <div className="relative">
            <Input
              id="internalId"
              name="internalId"
              value={pet.internalId || ""}
              onChange={handleInputChange}
              placeholder="ID Interno (opcional)"
              className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="name"
              name="name"
              value={pet.name}
              onChange={handleInputChange}
              required
              className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="species" className="text-sm font-medium text-gray-700">
            Especie <span className="text-red-500">*</span>
          </Label>
          <Select
            name="species"
            value={pet.species}
            onValueChange={(value) => handleSelectChange(value, "species")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar especie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="canino">Canino</SelectItem>
              <SelectItem value="felino">Felino</SelectItem>
              <SelectItem value="ave">Ave</SelectItem>
              <SelectItem value="huron">Hurón</SelectItem>
              <SelectItem value="conejo">Conejo</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
            Raza <span className="text-red-500">*</span>
          </Label>
          <Input
            id="breed"
            name="breed"
            value={pet.breed}
            onChange={handleInputChange}
            required
            className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={pet.dateOfBirth}
              onChange={handleInputChange}
              required
              className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
            Peso (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            value={pet.weight}
            onChange={handleInputChange}
            required
            className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Género <span className="text-red-500">*</span>
          </Label>
          <Select
            name="gender"
            value={pet.gender}
            onValueChange={(value) => handleSelectChange(value, "gender")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="macho">Macho</SelectItem>
              <SelectItem value="hembra">Hembra</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="microchipNumber" className="text-sm font-medium text-gray-700">
            Número de Microchip
          </Label>
          <Input
            id="microchipNumber"
            name="microchipNumber"
            value={pet.microchipNumber}
            onChange={handleInputChange}
            maxLength={15}
            inputMode="numeric"
            pattern="\d*"
            className="pl-3 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center space-x-2 col-span-2">
          <Checkbox
            id="isNeutered"
            checked={pet.isNeutered}
            onCheckedChange={(checked) => 
              handleCheckboxChange(checked as boolean, "isNeutered")
            }
            className="rounded-md h-5 w-5"
          />
          <Label 
            htmlFor="isNeutered" 
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Esterilizado/Castrado
          </Label>
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="medicalHistory" className="text-sm font-medium text-gray-700">
            Historial Médico
          </Label>
          <Textarea
            id="medicalHistory"
            name="medicalHistory"
            value={pet.medicalHistory}
            onChange={handleInputChange}
            rows={4}
            className="w-full border rounded-lg focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Ingrese notas o historial médico relevante..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="px-4 py-2"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="px-4 py-2"
        >
          {isEditing ? "Actualizar Mascota" : "Agregar Mascota"}
        </Button>
      </div>
    </form>
  );

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Editar Mascota
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl font-semibold">Editar Mascota</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-gray-500">
              Realiza cambios en la información de la mascota aquí. Haz clic en guardar cuando hayas terminado.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Editar Mascota" : "Agregar Nueva Mascota"}
      </h1>
      {formContent}
    </div>
  );
};

export default PetForm;