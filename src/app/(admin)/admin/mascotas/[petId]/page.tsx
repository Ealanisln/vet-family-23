// app/(admin)/admin/mascotas/[petId]/page.tsx

import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";
import { VaccinationContainer } from "@/components/Vaccination/VaccinationContainer";
import { DewormingContainer } from "@/components/Deworming/DewormingContainer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PetForm from "@/components/Admin/ui/PetForm";

export default async function PetDetailsPage(
  props: {
    params: Promise<{ petId: string }>;
  }
) {
  const params = await props.params;
  const pet = await prisma.pet.findUnique({
    where: { id: params.petId },
    include: {
      user: true,
      vaccinations: true,
      Deworming: true,
      medicalHistory: {
        orderBy: {
          visitDate: 'desc'
        }
      },
    },
  });

  if (!pet) {
    notFound();
  }

  const age = format(new Date(pet.dateOfBirth), "dd 'de' MMMM 'de' yyyy", {
    locale: es,
  });

  const formattedPet = {
    id: pet.id,
    userId: pet.userId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    dateOfBirth: pet.dateOfBirth.toISOString().split('T')[0],
    gender: pet.gender,
    weight: pet.weight.toString(),
    microchipNumber: pet.microchipNumber || undefined,
    internalId: pet.internalId || undefined,
    isNeutered: pet.isNeutered,
    isDeceased: pet.isDeceased,
    medicalHistory: pet.medicalHistory.length > 0 ? pet.medicalHistory[0].notes || "" : "",
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-6 sm:py-10">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/admin/mascotas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </Link>
          <PetForm
            isEditing={true}
            initialPet={formattedPet}
            userId={pet.userId}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Mascota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">{pet.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Especie</p>
                  <p className="mt-1">{pet.species}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Raza</p>
                  <p className="mt-1">{pet.breed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Fecha de Nacimiento
                  </p>
                  <p className="mt-1">{age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Género</p>
                  <p className="mt-1">{pet.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Peso</p>
                  <p className="mt-1">{pet.weight} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Número de Microchip
                  </p>
                  <p className="mt-1">{pet.microchipNumber || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID Interno</p>
                  <p className="mt-1">{pet.internalId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <div className="mt-1">
                    <Badge
                      variant={pet.isDeceased ? "destructive" : "default"}
                      className="rounded-full"
                    >
                      {pet.isDeceased ? "Fallecido" : "Activo"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Esterilizado/a</p>
                  <div className="mt-1">
                    <Badge
                      variant={pet.isNeutered ? "default" : "secondary"}
                      className="rounded-full"
                    >
                      {pet.isNeutered ? "Sí" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="mt-1">
                    {pet.user.firstName} {pet.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1">{pet.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="mt-1">{pet.user.phone || "No registrado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="mt-1">{pet.user.address || "No registrada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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
                          <TableHead>Medicamentos</TableHead>
                          <TableHead>Notas</TableHead>
                          <TableHead className="w-[80px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pet.medicalHistory.map((record) => {
                          console.log("Medical Record Data:", JSON.stringify(record, null, 2));
                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {format(new Date(record.visitDate), "dd/MM/yyyy")}
                              </TableCell>
                              <TableCell>{record.reasonForVisit}</TableCell>
                              <TableCell>{record.diagnosis}</TableCell>
                              <TableCell>{record.treatment}</TableCell>
                              <TableCell>
                                {(() => {
                                  const prescriptions = (record.prescriptions || []).map(prescription =>
                                    prescription.replace(/Prueba\\s*-\\s*Testing,?\\s*/g, '')
                                  ).filter(p => p.trim());
                                  
                                  const allMeds = [...prescriptions];
                                  
                                  return allMeds.length > 0
                                    ? allMeds.join(", ")
                                    : "N/A";
                                })()}
                              </TableCell>
                              <TableCell>{record.notes || "N/A"}</TableCell>
                              <TableCell>
                                <MedicalRecordDialog
                                  existingRecord={{
                                    id: record.id,
                                    petId: record.petId,
                                    userId: pet.userId,
                                    visitDate: new Date(record.visitDate).toISOString().split("T")[0],
                                    reasonForVisit: record.reasonForVisit,
                                    diagnosis: record.diagnosis,
                                    treatment: record.treatment,
                                    prescriptions: record.prescriptions,
                                    notes: record.notes || undefined,
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
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

          <DewormingContainer
            petId={pet.id}
            petSpecies={pet.species}
            dewormings={pet.Deworming}
          />
        </div>
      </div>
    </div>
  );
}