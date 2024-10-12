// components/Pet/AddPetForm.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";
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
import { ArrowLeftIcon, PlusIcon } from "lucide-react";

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  weight: string;
  microchipNumber?: string;
  medicalHistory?: string;
}

interface PetDataForSubmit {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber?: string;
  medicalHistory?: string;
}

interface AddPetFormProps {
  onSubmit: (userId: string, petData: PetDataForSubmit) => void;
  onCancel: () => void;
  userId: string;
}

const AddPetForm: React.FC<AddPetFormProps> = ({
  onSubmit,
  onCancel,
  userId,
}) => {
  const [pet, setPet] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    gender: "",
    weight: "",
    microchipNumber: "",
    medicalHistory: "",
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const petDataForSubmit: PetDataForSubmit = {
      ...pet,
      dateOfBirth: new Date(pet.dateOfBirth),
      weight: parseFloat(pet.weight),
    };
    onSubmit(userId, petDataForSubmit);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Información de la Mascota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="perro">Perro</SelectItem>
                  <SelectItem value="gato">Gato</SelectItem>
                  <SelectItem value="ave">Ave</SelectItem>
                  <SelectItem value="huron">Hurón</SelectItem>
                  <SelectItem value="huron">Conejo</SelectItem>
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
              <Label htmlFor="gender">Género</Label>
              <Select
                name="gender"
                onValueChange={(value) => handleSelectChange(value, "gender")}
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
              <Label htmlFor="microchipNumber">Número de Microchip</Label>
              <Input
                id="microchipNumber"
                name="microchipNumber"
                value={pet.microchipNumber}
                onChange={handleInputChange}
                maxLength={15} // Limita a 15 caracteres
                inputMode="numeric" // Sugerencia de teclado numérico en móviles
                pattern="\d*" // Acepta solo números
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="medicalHistory">Historia Médica</Label>
              <Textarea
                id="medicalHistory"
                name="medicalHistory"
                value={pet.medicalHistory}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button type="submit">
            <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddPetForm;
