"use client";
import React from "react";
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
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import ClientePetForm from "@/components/Clientes/ClientePetForm";

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
}

export default function PetDetailsView({ pet }: { pet: Pet }) {
  const router = useRouter();
  const params = useParams();

  const formatPetForForm = (pet: Pet) => {
    const { medicalHistory, vaccinations, ...petData } = pet;
    return {
      ...petData,
      dateOfBirth: pet.dateOfBirth.toISOString().split("T")[0],
      weight: pet.weight.toString(),
      microchipNumber: pet.microchipNumber || undefined,
    };
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href={`/admin/clientes/${params.id}`}>
            <Button variant="outline" className="mb-2 sm:mb-0">
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Detalles de {pet.name}</h1>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0">
          <ClientePetForm
            isEditing={true}
            initialPet={formatPetForForm(pet)}
            onClose={() => {}}
          />
        </div>
      </div>

      
      {/* Basic Information Card */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: 'Especie', value: pet.species },
              { label: 'Raza', value: pet.breed },
              { label: 'Fecha de Nacimiento', value: pet.dateOfBirth.toLocaleDateString() },
              { label: 'Género', value: pet.gender },
              { label: 'Peso', value: `${pet.weight} kg` },
              { label: 'Número de Microchip', value: pet.microchipNumber || 'N/A' },
            ].map(({ label, value }, index) => (
              <div key={index} className="space-y-1">
                <p className="font-semibold text-sm text-muted-foreground">{label}</p>
                <p className="text-base">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medical History Card */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle>Historial Médico</CardTitle>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.medicalHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.visitDate.toLocaleDateString()}</TableCell>
                        <TableCell>{record.reasonForVisit}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.notes || "N/A"}</TableCell>
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

      {/* Vaccinations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Vacunas</CardTitle>
        </CardHeader>
        <CardContent>
          {pet.vaccinations.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:-mx-6">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha de Administración</TableHead>
                      <TableHead>Próxima Dosis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.vaccinations.map((vaccination) => (
                      <TableRow key={vaccination.id}>
                        <TableCell className="font-medium">{vaccination.vaccineType}</TableCell>
                        <TableCell>
                          {vaccination.administrationDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {vaccination.nextDoseDate.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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