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
import { Switch } from "@/components/ui/switch";

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
      await onSubmit(petData);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo actualizar si es un número válido o una cadena vacía
    if (value === "" || !isNaN(parseFloat(value))) {
      setPetData({ 
        ...petData, 
        weight: value === "" ? 0 : parseFloat(value) 
      });
    }
  };

  const handleInternalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPetData({ ...petData, internalId: value });
  };

  const isFormValid = () => {
    return (
      petData.name.trim() !== "" &&
      petData.species.trim() !== "" &&
      petData.breed.trim() !== "" &&
      petData.gender.trim() !== "" &&
      petData.weight > 0 &&
      !isNaN(petData.weight)
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
                    <SelectItem value="perro">Canino</SelectItem>
                    <SelectItem value="gato">Felino</SelectItem>
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
                min="0.1"
                value={petData.weight || ""}
                onChange={handleWeightChange}
                disabled={isSubmitting}
                required
                placeholder="0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="microchipNumber">Número de Microchip</Label>
              <Input
                id="microchipNumber"
                value={petData.microchipNumber || ""}
                onChange={(e) => setPetData({ ...petData, microchipNumber: e.target.value })}
                disabled={isSubmitting}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="medicalHistory">Historial Médico</Label>
              <Textarea
                id="medicalHistory"
                value={petData.medicalHistory || ""}
                onChange={(e) => setPetData({ ...petData, medicalHistory: e.target.value })}
                disabled={isSubmitting}
                rows={4}
                placeholder="Información médica relevante (opcional)"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isNeutered"
                  checked={petData.isNeutered}
                  onCheckedChange={(checked) => setPetData({ ...petData, isNeutered: checked })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isNeutered">Esterilizado/a</Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDeceased"
                  checked={petData.isDeceased}
                  onCheckedChange={(checked) => setPetData({ ...petData, isDeceased: checked })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isDeceased">Fallecido/a</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalId">ID Interno</Label>
              <Input
                id="internalId"
                value={petData.internalId || ""}
                onChange={handleInternalIdChange}
                disabled={isSubmitting}
                placeholder="Opcional - debe ser único"
              />
              {petData.internalId && petData.internalId.trim() !== "" && (
                <p className="text-sm text-gray-600">
                  Este ID debe ser único. Si se deja vacío, no se asignará ningún ID interno.
                </p>
              )}
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