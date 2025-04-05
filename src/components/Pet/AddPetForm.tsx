// components/Pet/AddPetForm.tsx



import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2 } from "lucide-react";

interface AddPetFormProps {
  onSubmit: (petData: PetDataForSubmit) => Promise<void>;
  onCancel: () => void;
  userId: string;
  isSubmitting: boolean;
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
  isNeutered: boolean;
  internalId?: string;
  isDeceased: boolean;
}

const AddPetForm: React.FC<AddPetFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [petData, setPetData] = useState<PetDataForSubmit>({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: new Date(),
    gender: "",
    weight: 0,
    microchipNumber: "",
    medicalHistory: "",
    isNeutered: false,
    internalId: "",
    isDeceased: false
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      // Ya no pasamos el userId aquí porque lo manejará el componente padre
      await onSubmit(petData);
    }
  };

  const isFormValid = () => {
    return (
      petData.name.trim() !== "" &&
      petData.species.trim() !== "" &&
      petData.breed.trim() !== "" &&
      petData.gender.trim() !== "" &&
      petData.weight > 0
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva Mascota</CardTitle>
      </CardHeader>
      <form onSubmit={handleFormSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={petData.name}
                onChange={(e) => setPetData({ ...petData, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">
                Especie <span className="text-red-500">*</span>
              </Label>
              <Select
                value={petData.species}
                onValueChange={(value) => setPetData({ ...petData, species: value })}
                disabled={isSubmitting}
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
              <Label htmlFor="breed">
                Raza <span className="text-red-500">*</span>
              </Label>
              <Input
                id="breed"
                value={petData.breed}
                onChange={(e) => setPetData({ ...petData, breed: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={petData.dateOfBirth.toISOString().split('T')[0]}
                onChange={(e) => setPetData({ ...petData, dateOfBirth: new Date(e.target.value) })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Género <span className="text-red-500">*</span>
              </Label>
              <Select
                value={petData.gender}
                onValueChange={(value) => setPetData({ ...petData, gender: value })}
                disabled={isSubmitting}
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
              <Label htmlFor="weight">
                Peso (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={petData.weight}
                onChange={(e) => setPetData({ ...petData, weight: parseFloat(e.target.value) })}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microchipNumber">Número de Microchip</Label>
              <Input
                id="microchipNumber"
                value={petData.microchipNumber}
                onChange={(e) => setPetData({ ...petData, microchipNumber: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="medicalHistory">Historial Médico</Label>
              <Textarea
                id="medicalHistory"
                value={petData.medicalHistory}
                onChange={(e) => setPetData({ ...petData, medicalHistory: e.target.value })}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={petData.isNeutered}
                  onChange={(e) => setPetData({ ...petData, isNeutered: e.target.checked })}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Esterilizado/a</span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={petData.isDeceased}
                  onChange={(e) => setPetData({ ...petData, isDeceased: e.target.checked })}
                  disabled={isSubmitting}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Fallecido/a</span>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalId">ID Interno</Label>
              <Input
                id="internalId"
                value={petData.internalId}
                onChange={(e) => setPetData({ ...petData, internalId: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          
          <Button 
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="relative"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse mr-2">Guardando mascota...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              'Guardar Mascota'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddPetForm;