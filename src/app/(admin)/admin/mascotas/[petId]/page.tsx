// app/(admin)/admin/mascotas/[petId]/page.tsx

import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, PawPrint, Scale, Zap, IdCard, Heart, Shield, FileText, Syringe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prismaDB";
import PetForm from "@/components/Admin/ui/PetForm";
import { MedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";
import { VaccinationContainer } from "@/components/Vaccination/VaccinationContainer";
import { DewormingContainer } from "@/components/Deworming/DewormingContainer";

export default async function PetDetailsPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      User: true,
      Vaccination: true,
      Deworming: true,
      MedicalHistory: {
        orderBy: {
          visitDate: 'desc'
        }
      },
    },
  });

  if (!pet) {
    notFound();
  }

  const calculateAge = (dateOfBirth: Date): string => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    if (age === 0) {
      const months = today.getMonth() - birthDate.getMonth() + (12 * (today.getFullYear() - birthDate.getFullYear()));
      return months <= 1 ? "Menos de 1 mes" : `${months} meses`;
    }
  
    return `${age} año${age !== 1 ? 's' : ''}`;
  };

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
    medicalHistory: pet.MedicalHistory.length > 0 ? pet.MedicalHistory[0].notes || "" : "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin/mascotas">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              {pet.name}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <span>{pet.species} • {pet.breed} • {calculateAge(pet.dateOfBirth)}</span>
              {pet.isDeceased && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 ml-2">
                  Finado
                </Badge>
              )}
              {pet.isNeutered && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 ml-2">
                  <Shield className="w-3 h-3 mr-1" />
                  Esterilizado
                </Badge>
              )}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <PetForm
              isEditing={true}
              initialPet={formattedPet}
              userId={pet.userId}
            />
          </div>
        </div>

        {/* Información de la Mascota */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              Información de la Mascota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Nombre</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <PawPrint className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Especie</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.species}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg">
                <div className="p-2 bg-green-200 rounded-lg">
                  <PawPrint className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Raza</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.breed}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Calendar className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700">Fecha de Nacimiento</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(pet.dateOfBirth), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-lg">
                <div className="p-2 bg-pink-200 rounded-lg">
                  <Heart className="h-4 w-4 text-pink-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-pink-700">Género</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.gender}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-lg">
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <Scale className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700">Peso</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.weight} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <Zap className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Número de Microchip</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.microchipNumber || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-lg">
                <div className="p-2 bg-teal-200 rounded-lg">
                  <IdCard className="h-4 w-4 text-teal-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700">ID Interno</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.internalId || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Estado de la Mascota */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Esterilizado/Castrado</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.isNeutered ? "Sí" : "No"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Heart className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.isDeceased ? "Fallecido" : "Activo"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del Propietario */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              Información del Propietario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <User className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">Nombre</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.User.firstName} {pet.User.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-lg">
                <div className="p-2 bg-green-200 rounded-lg">
                  <Mail className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.User.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-lg">
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Phone className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">Teléfono</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.User.phone || "No registrado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg">
                <div className="p-2 bg-orange-200 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">Dirección</p>
                  <p className="text-lg font-semibold text-gray-900">{pet.User.address || "No registrada"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial Médico */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Syringe className="h-5 w-5 text-red-600" />
                </div>
                Historial Médico
              </CardTitle>
              <MedicalRecordDialog petId={pet.id} />
            </div>
          </CardHeader>
          <CardContent>
            {pet.MedicalHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                      <TableHead className="font-semibold text-gray-700">Razón</TableHead>
                      <TableHead className="font-semibold text-gray-700">Diagnóstico</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tratamiento</TableHead>
                      <TableHead className="font-semibold text-gray-700">Medicamentos</TableHead>
                      <TableHead className="font-semibold text-gray-700">Notas</TableHead>
                      <TableHead className="font-semibold text-gray-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.MedicalHistory.map((record, index) => (
                      <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                        <TableCell className="font-medium">
                          {format(new Date(record.visitDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{record.reasonForVisit}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>
                          {(() => {
                            const prescriptions = (record.prescriptions || []).map((prescription: string) =>
                              prescription.replace(/Prueba\\s*-\\s*Testing,?\\s*/g, '')
                            ).filter((p: string) => p.trim());
                            
                            return prescriptions.length > 0
                              ? prescriptions.join(", ")
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No hay registros médicos disponibles.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Los registros médicos aparecerán aquí una vez que se agreguen.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vacunas y Desparasitación */}
        <div className="space-y-8">
          <VaccinationContainer
            petId={pet.id}
            petSpecies={pet.species}
            vaccinations={pet.Vaccination}
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