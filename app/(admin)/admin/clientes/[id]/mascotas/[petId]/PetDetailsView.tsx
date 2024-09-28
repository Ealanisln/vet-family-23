// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/PetDetailsView.tsx

"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditIcon, ArrowLeftIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { AddMedicalRecordDialog } from "@/components/Admin/AddMedicalRecord";
import PetForm from "@/components/Admin/ui/PetForm";

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
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  medicalHistory: MedicalHistory[];
  vaccinations: Vaccination[];
  // Note: userId is not typically stored on the Pet model itself
}

export default function PetDetailsView({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleClose = () => {
    setOpen(false);
  };

  const formatPetForForm = (pet: Pet) => {
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      dateOfBirth: pet.dateOfBirth.toISOString().split("T")[0],
      gender: pet.gender,
      weight: pet.weight.toString(),
      microchipNumber: pet.microchipNumber || undefined,
      medicalHistory:
        pet.medicalHistory.length > 0 ? pet.medicalHistory[0].notes || "" : "",
    };
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Detalles de {pet.name}</h1>
        <div className="space-x-2">
          <Link href={`/admin/clientes/${params.id}`}>
            <Button variant="outline">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
          </Link>
          <Button>
            <PetForm
              isEditing={true}
              initialPet={formatPetForForm(pet)}
              onClose={handleClose}
            />
          </Button>
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Especie:</p>
              <p>{pet.species}</p>
            </div>
            <div>
              <p className="font-semibold">Raza:</p>
              <p>{pet.breed}</p>
            </div>
            <div>
              <p className="font-semibold">Fecha de Nacimiento:</p>
              <p>{pet.dateOfBirth.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold">Género:</p>
              <p>{pet.gender}</p>
            </div>
            <div>
              <p className="font-semibold">Peso:</p>
              <p>{pet.weight} kg</p>
            </div>
            <div>
              <p className="font-semibold">Número de Microchip:</p>
              <p>{pet.microchipNumber || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Historial Médico</CardTitle>
            <AddMedicalRecordDialog />
          </div>
        </CardHeader>
        <CardContent>
          {pet.medicalHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Razón</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Tratamiento</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pet.medicalHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.visitDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.reasonForVisit}</TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{record.treatment}</TableCell>
                    <TableCell>{record.notes || "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              No hay registros médicos disponibles.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vacunas</CardTitle>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" /> Nueva Vacuna
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pet.vaccinations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha de Administración</TableHead>
                  <TableHead>Próxima Dosis</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pet.vaccinations.map((vaccination) => (
                  <TableRow key={vaccination.id}>
                    <TableCell>{vaccination.vaccineType}</TableCell>
                    <TableCell>
                      {vaccination.administrationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {vaccination.nextDoseDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              No hay registros de vacunación disponibles.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
