"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { ArrowLeftIcon, PlusIcon, Edit } from "lucide-react";
import { addPet, updatePet } from "@/app/actions/add-edit-pet";
import { Checkbox } from "@/components/ui/checkbox";

interface PetFormProps {
  isEditing?: boolean;
  initialPet?: Pet | null;
  onClose?: () => void;
}

interface Pet {
  id?: string;
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
}) => {
  const params = useParams();
  const router = useRouter();
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
    const userId = params.id as string;
    const petData = {
      ...pet,
      internalId: pet.internalId || undefined,
      dateOfBirth: new Date(pet.dateOfBirth),
      weight: parseFloat(pet.weight),
      isNeutered: pet.isNeutered,
    };

    let result;
    if (isEditing && pet.id) {
      result = await updatePet(userId, pet.id, petData);
    } else {
      result = await addPet(userId, petData);
    }

    if (result.success) {
      if (onClose) onClose();
      router.push(`/admin/clientes/${userId}`);
    } else {
      console.error(result.error);
    }
  };

  const formContent = (
    <>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="internalId">ID Interno</Label>
            <Input
              id="internalId"
              name="internalId"
              value={pet.internalId || ""}
              onChange={handleInputChange}
              placeholder="ID Interno (opcional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={pet.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="species">Especie</Label>
            <Select
              name="species"
              onValueChange={(value) => handleSelectChange(value, "species")}
              value={pet.species}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perro">Perro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
                <SelectItem value="ave">Ave</SelectItem>
                <SelectItem value="huron">Hurón</SelectItem>
                <SelectItem value="conejo">Conejo</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Raza</Label>
            <Input
              id="breed"
              name="breed"
              value={pet.breed}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={pet.dateOfBirth}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              value={pet.weight}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              name="gender"
              onValueChange={(value) => handleSelectChange(value, "gender")}
              value={pet.gender}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="hembra">Hembra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="microchipNumber">Número de Microchip</Label>
            <Input
              id="microchipNumber"
              name="microchipNumber"
              value={pet.microchipNumber}
              onChange={handleInputChange}
              maxLength={15}
              inputMode="numeric"
              pattern="\d*"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNeutered"
              checked={pet.isNeutered}
              onCheckedChange={(checked) => 
                handleCheckboxChange(checked as boolean, "isNeutered")
              }
            />
            <Label htmlFor="isNeutered">Esterilizado/Castrado</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicalHistory">Historial Médico</Label>
          <Textarea
            id="medicalHistory"
            name="medicalHistory"
            value={pet.medicalHistory}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onClose || (() => router.back())}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Button type="submit">
          {isEditing ? (
            <>
              <Edit className="mr-2 h-4 w-4" /> Actualizar Mascota
            </>
          ) : (
            <>
              <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  if (isEditing) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Editar Mascota</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Mascota</DialogTitle>
            <DialogDescription>
              Realiza cambios en la información de la mascota aquí. Haz clic en
              guardar cuando hayas terminado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>{formContent}</form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isEditing ? "Editar Mascota" : "Agregar Nueva Mascota"}
      </h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información de la Mascota</CardTitle>
          </CardHeader>
          {formContent}
        </form>
      </Card>
    </div>
  );
};

export default PetForm;