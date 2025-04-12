// src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx

"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { addPet } from "@/app/actions/add-edit-pet";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [pet, setPet] = useState({
    name: "",
    species: "",
    breed: "",
    dateOfBirth: "",
    weight: "",
    gender: "",
    microchipNumber: "",
    isNeutered: false,
    internalId: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleNeuteredChange = (checked: boolean) => {
    setPet((prevState) => ({ ...prevState, isNeutered: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(new Date(pet.dateOfBirth).getTime())) {
      alert("Por favor ingrese una fecha válida");
      return;
    }

    // Validate weight
    const weight = parseFloat(pet.weight);
    if (isNaN(weight)) {
      alert("Por favor ingrese un peso válido");
      return;
    }

    const userId = params.id as string;
    try {
      const result = await addPet(userId, {
        ...pet,
        dateOfBirth: new Date(pet.dateOfBirth),
        weight: weight,
      });

      if (result.success) {
        router.push(`/admin/clientes/${userId}`);
      } else {
        alert(`Error: ${result.error}`);
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Ocurrió un error al intentar agregar la mascota");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agregar Nueva Mascota</h1>
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
                  onValueChange={(value) =>
                    handleSelectChange(value, "species")
                  }
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
              <div className="space-y-2">
                <Label htmlFor="internalId">ID Interno (opcional)</Label>
                <Input
                  id="internalId"
                  name="internalId"
                  type="number"
                  value={pet.internalId ?? ""}
                  onChange={handleInputChange}
                  className="w-full sm:w-1/2"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isNeutered">Esterilizado/a</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isNeutered"
                    checked={pet.isNeutered}
                    onCheckedChange={handleNeuteredChange}
                  />
                  <Label htmlFor="isNeutered">
                    {pet.isNeutered ? "Sí" : "No"}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
            <Button type="submit">
              <PlusIcon className="mr-2 h-4 w-4" /> Agregar Mascota
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
