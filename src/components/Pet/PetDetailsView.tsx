// src/components/Pet/PetDetailsView.tsx

"use client";

import React, { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import PetForm from "@/components/Admin/ui/PetForm";
import { MedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";
import {
  updatePetNeuteredStatus,
  updatePetDeceasedStatus,
} from "@/app/actions/add-edit-pet";
import { VaccinationContainer } from "@/components/Vaccination/VaccinationContainer";

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

interface Pet {
  id: string;
  userId: string;
  internalId?: string | null;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  isNeutered: boolean;
  isDeceased: boolean;
  medicalHistory: MedicalHistory[];
  vaccinations: Vaccination[];
}

const calculateAge = (dateOfBirth: Date): string => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 1) {
    const months = monthDifference < 0 ? monthDifference + 12 : monthDifference;
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }

  return `${age} ${age === 1 ? "año" : "años"}`;
};

export default function PetDetailsView({ pet }: { pet: Pet }) {
  const [isNeutered, setIsNeutered] = useState(pet.isNeutered);
  const [isDeceased, setIsDeceased] = useState(pet.isDeceased);
  const params = useParams();
  const pathname = usePathname();

  const handleNeuteredChange = async (checked: boolean) => {
    setIsNeutered(checked);
    const result = await updatePetNeuteredStatus(
      params.id as string,
      pet.id,
      checked
    );
    if (result.success) {
      console.log("Estado de esterilización actualizado correctamente");
    } else {
      console.error(
        "Error al actualizar el estado de esterilización:",
        result.error
      );
      setIsNeutered(!checked);
    }
  };

  const handleDeceasedChange = async (checked: boolean) => {
    setIsDeceased(checked);
    const result = await updatePetDeceasedStatus(
      params.id as string,
      pet.id,
      checked
    );
    if (result.success) {
      console.log("Estado de fallecimiento actualizado correctamente");
    } else {
      console.error(
        "Error al actualizar el estado de fallecimiento:",
        result.error
      );
      setIsDeceased(!checked);
    }
  };
  const formatPetForForm = (pet: Pet) => {
    return {
      id: pet.id,
      userId: pet.userId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth.toISOString().split("T")[0],
      gender: pet.gender,
      weight: pet.weight.toString(),
      microchipNumber: pet.microchipNumber || undefined,
      internalId: pet.internalId || undefined,
      isNeutered: pet.isNeutered,
      isDeceased: pet.isDeceased,
      medicalHistory:
        pet.medicalHistory.length > 0 ? pet.medicalHistory[0].notes || "" : "",
    };
  };

  const getBackLink = () => {
    if (pathname.includes("/admin/clientes/")) {
      return `/admin/clientes/${params.id}`;
    } else {
      return "/admin/mascotas";
    }
  };

  const infoItems = [
    { label: "Especie", value: pet.species },
    { label: "Raza", value: pet.breed },
    {
      label: "Fecha de Nacimiento",
      value: pet.dateOfBirth.toLocaleDateString(),
    },
    { label: "Edad", value: calculateAge(pet.dateOfBirth) },
    { label: "Género", value: pet.gender },
    { label: "Peso", value: `${pet.weight} kg` },
    { label: "Número de Microchip", value: pet.microchipNumber || "N/A" },
    { label: "ID Interno", value: pet.internalId || "N/A" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href={getBackLink()}>
            <Button variant="outline" className="mb-2 sm:mb-0">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            Detalles de {pet.name}
            {isDeceased ? " (Finado)" : ""}
          </h1>{" "}
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <PetForm
            isEditing={true}
            initialPet={formatPetForForm(pet)}
            userId={pet.userId}
          />
        </div>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {infoItems.map(({ label, value }, index) => (
              <div key={index} className="space-y-1">
                <p className="font-semibold text-sm text-muted-foreground">
                  {label}
                </p>
                <p className="text-base">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isNeutered"
                  checked={isNeutered}
                  onCheckedChange={handleNeuteredChange}
                />
                <label
                  htmlFor="isNeutered"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Esterilizado/a
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Indica si la mascota ha sido esterilizada o castrada.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isDeceased"
                checked={isDeceased}
                onCheckedChange={handleDeceasedChange}
              />
              <label
                htmlFor="isDeceased"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Fallecido/a
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Historial Médico</CardTitle>
            <MedicalRecordDialog petId={pet.id} />
          </div>
        </CardHeader>
        <CardContent>
          {pet.medicalHistory.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.medicalHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.visitDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.reasonForVisit}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.notes || "N/A"}</TableCell>
                        <TableCell>
                          <MedicalRecordDialog
                            existingRecord={{
                              id: record.id,
                              petId: record.petId,
                              userId: pet.userId,
                              visitDate: record.visitDate
                                .toISOString()
                                .split("T")[0],
                              reasonForVisit: record.reasonForVisit,
                              diagnosis: record.diagnosis,
                              treatment: record.treatment,
                              prescriptions: record.prescriptions,
                              notes: record.notes || undefined,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No hay registros médicos disponibles.
            </p>
          )}
        </CardContent>
      </Card>

      <VaccinationContainer
        petId={pet.id}
        petSpecies={pet.species}
        vaccinations={pet.vaccinations}
      />
    </div>
  );
}
