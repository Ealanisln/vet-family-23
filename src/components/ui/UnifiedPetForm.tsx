"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2, Edit, PlusIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface PetFormData {
  id?: string;
  userId?: string;
  internalId?: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date | string;
  gender: string;
  weight: number | string;
  microchipNumber?: string;
  medicalHistory?: string;
  isNeutered: boolean;
  isDeceased: boolean;
}

interface UnifiedPetFormProps {
  // Form behavior
  isEditing?: boolean;
  initialPet?: Partial<PetFormData> | null;
  
  // Required data
  userId: string;
  
  // Callbacks
  onSubmit: (petData: PetFormData) => Promise<void>;
  onCancel: () => void;
  
  // UI customization
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  isSubmitting?: boolean;
  
  // Form configuration
  showMedicalHistory?: boolean;
  showInternalId?: boolean;
  showDeceasedToggle?: boolean;
  
  // Layout
  showAsCard?: boolean;
  className?: string;
}

const UnifiedPetForm: React.FC<UnifiedPetFormProps> = ({
  isEditing = false,
  initialPet = null,
  userId,
  onSubmit,
  onCancel,
  title,
  submitButtonText,
  cancelButtonText = "Cancelar",
  isSubmitting = false,
  showMedicalHistory = false,
  showInternalId = true,
  showDeceasedToggle = true,
  showAsCard = true,
  className = "",
}) => {
  
  const [petData, setPetData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: new Date(),
    gender: "",
    weight: 0,
    microchipNumber: "",
    medicalHistory: "",
    isNeutered: false,
    isDeceased: false,
    internalId: "",
  });

  // Initialize form data
  useEffect(() => {
    if (initialPet) {
      setPetData({
        id: initialPet.id || "",
        userId: initialPet.userId || userId,
        name: initialPet.name || "",
        species: initialPet.species || "",
        breed: initialPet.breed || "",
        dateOfBirth: initialPet.dateOfBirth 
          ? (typeof initialPet.dateOfBirth === 'string' 
             ? new Date(initialPet.dateOfBirth) 
             : initialPet.dateOfBirth)
          : new Date(),
        gender: initialPet.gender || "",
        weight: initialPet.weight || 0,
        microchipNumber: initialPet.microchipNumber || "",
        medicalHistory: initialPet.medicalHistory || "",
        isNeutered: initialPet.isNeutered || false,
        isDeceased: initialPet.isDeceased || false,
        internalId: initialPet.internalId || "",
      });
    }
  }, [initialPet, userId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "weight") {
      // Solo actualizar si es un número válido o una cadena vacía
      if (value === "" || !isNaN(parseFloat(value))) {
        setPetData(prev => ({ 
          ...prev, 
          [name]: value === "" ? 0 : parseFloat(value) 
        }));
      }
      return;
    }
    
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setPetData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setPetData(prev => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPetData(prev => ({ 
      ...prev, 
      dateOfBirth: new Date(e.target.value) 
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && isFormValid()) {
      await onSubmit(petData);
    }
  };

  const isFormValid = () => {
    const weight = typeof petData.weight === 'string' ? parseFloat(petData.weight) : petData.weight;
    return (
      petData.name.trim() !== "" &&
      petData.species.trim() !== "" &&
      petData.breed.trim() !== "" &&
      petData.gender.trim() !== "" &&
      weight > 0 &&
      !isNaN(weight)
    );
  };

  const getDateString = () => {
    if (petData.dateOfBirth instanceof Date) {
      return petData.dateOfBirth.toISOString().split('T')[0];
    }
    if (typeof petData.dateOfBirth === 'string') {
      return new Date(petData.dateOfBirth).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const formTitle = title || (isEditing ? "Editar Mascota" : "Agregar Nueva Mascota");
  const submitText = submitButtonText || (isEditing ? "Actualizar Mascota" : "Guardar Mascota");

  const formContent = (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Internal ID */}
        {showInternalId && (
          <div className="space-y-2">
            <Label htmlFor="internalId" className="text-sm font-medium text-gray-700">
              ID Interno
            </Label>
            <Input
              id="internalId"
              name="internalId"
              value={petData.internalId || ""}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Opcional - debe ser único"
              className="w-full"
            />
            {petData.internalId && petData.internalId.trim() !== "" && (
              <p className="text-xs text-gray-600">
                Este ID debe ser único. Si se deja vacío, no se asignará ningún ID interno.
              </p>
            )}
          </div>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={petData.name}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            className="w-full"
          />
        </div>

        {/* Species */}
        <div className="space-y-2">
          <Label htmlFor="species" className="text-sm font-medium text-gray-700">
            Especie <span className="text-red-500">*</span>
          </Label>
          <Select
            value={petData.species}
            onValueChange={(value) => handleSelectChange(value, "species")}
            disabled={isSubmitting}
          >
            <SelectTrigger>
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

        {/* Breed */}
        <div className="space-y-2">
          <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
            Raza <span className="text-red-500">*</span>
          </Label>
          <Input
            id="breed"
            name="breed"
            value={petData.breed}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            className="w-full"
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={getDateString()}
            onChange={handleDateChange}
            disabled={isSubmitting}
            required
            className="w-full"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Género <span className="text-red-500">*</span>
          </Label>
          <Select
            value={petData.gender}
            onValueChange={(value) => handleSelectChange(value, "gender")}
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

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
            Peso (kg) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            min="0.1"
            value={petData.weight || ""}
            onChange={handleInputChange}
            disabled={isSubmitting}
            required
            className="w-full"
            placeholder="0.0"
          />
        </div>

        {/* Microchip Number */}
        <div className="space-y-2">
          <Label htmlFor="microchipNumber" className="text-sm font-medium text-gray-700">
            Número de Microchip
          </Label>
          <Input
            id="microchipNumber"
            name="microchipNumber"
            value={petData.microchipNumber || ""}
            onChange={handleInputChange}
            disabled={isSubmitting}
            maxLength={15}
            inputMode="numeric"
            pattern="\d*"
            className="w-full"
            placeholder="Opcional"
          />
        </div>

        {/* Medical History */}
        {showMedicalHistory && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicalHistory" className="text-sm font-medium text-gray-700">
              Historial Médico
            </Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              value={petData.medicalHistory || ""}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Información médica relevante (opcional)"
              className="w-full min-h-[80px]"
            />
          </div>
        )}

        {/* Switches */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="isNeutered"
              checked={petData.isNeutered}
              onCheckedChange={(checked) => handleSwitchChange(checked, "isNeutered")}
              disabled={isSubmitting}
            />
            <Label htmlFor="isNeutered" className="text-sm font-medium text-gray-700 cursor-pointer">
              Esterilizado/a
            </Label>
          </div>

          {showDeceasedToggle && (
            <div className="flex items-center space-x-2">
              <Switch
                id="isDeceased"
                checked={petData.isDeceased}
                onCheckedChange={(checked) => handleSwitchChange(checked, "isDeceased")}
                disabled={isSubmitting}
              />
              <Label htmlFor="isDeceased" className="text-sm font-medium text-gray-700 cursor-pointer">
                Fallecido/a
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> {cancelButtonText}
        </Button>
        
        <Button 
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="relative"
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse mr-2">Guardando...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              {isEditing ? (
                <Edit className="mr-2 h-4 w-4" />
              ) : (
                <PlusIcon className="mr-2 h-4 w-4" />
              )}
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (showAsCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{formTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">{formTitle}</h2>
      {formContent}
    </div>
  );
};

export default UnifiedPetForm; 