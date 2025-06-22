// src/components/Pet/PetDetailsView.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeftIcon, 
  PawPrintIcon, 
  CalendarIcon, 
  ScaleIcon,
  MapPinIcon,
  IdCardIcon,
  HeartIcon,
  SyringeIcon,
  ShieldCheckIcon,
  FileTextIcon
} from "lucide-react";
import Link from "next/link";
import PetForm from "@/components/Admin/ui/PetForm";
import { MedicalRecordDialog } from "@/app/(admin)/admin/AddMedicalRecordDialog";
import {
  updatePetNeuteredStatus,
  updatePetDeceasedStatus,
} from "@/app/actions/add-edit-pet";
import { VaccinationContainer } from "@/components/Vaccination/VaccinationContainer";
import { DewormingContainer } from "@/components/Deworming/DewormingContainer";

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

interface Deworming {
  id: string;
  petId: string;
  dewormingType: string;
  stage: string;
  status: string;
  administrationDate: Date;
  nextDoseDate: Date;
  batchNumber?: string | null;
  manufacturer?: string | null;
  veterinarianName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  Deworming: Deworming[];
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
  const router = useRouter();

  // Update local state when pet prop changes
  useEffect(() => {
    setIsNeutered(pet.isNeutered);
    setIsDeceased(pet.isDeceased);
  }, [pet.isNeutered, pet.isDeceased]);

  const handlePetUpdated = useCallback(() => {
    // Use Next.js router to refresh the page data
    router.refresh();
  }, [router]);

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
      microchipNumber: pet.microchipNumber || "",
      internalId: pet.internalId || "",
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
    { 
      label: "Especie", 
      value: pet.species, 
      icon: PawPrintIcon,
      color: "text-blue-600"
    },
    { 
      label: "Raza", 
      value: pet.breed, 
      icon: PawPrintIcon,
      color: "text-purple-600"
    },
    {
      label: "Fecha de Nacimiento",
      value: pet.dateOfBirth.toLocaleDateString(),
      icon: CalendarIcon,
      color: "text-green-600"
    },
    { 
      label: "Edad", 
      value: calculateAge(pet.dateOfBirth), 
      icon: CalendarIcon,
      color: "text-amber-600"
    },
    { 
      label: "Género", 
      value: pet.gender, 
      icon: HeartIcon,
      color: "text-pink-600"
    },
    { 
      label: "Peso", 
      value: `${pet.weight} kg`, 
      icon: ScaleIcon,
      color: "text-indigo-600"
    },
    { 
      label: "Número de Microchip", 
      value: pet.microchipNumber || "N/A", 
      icon: MapPinIcon,
      color: "text-orange-600"
    },
    { 
      label: "ID Interno", 
      value: pet.internalId || "N/A", 
      icon: IdCardIcon,
      color: "text-teal-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <Link href={getBackLink()}>
                <Button variant="outline" size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" /> 
                  Volver
                </Button>
              </Link>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {pet.name}
                  </h1>
                  <div className="flex gap-2">
                    {isDeceased && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Finado
                      </Badge>
                    )}
                    {isNeutered && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                        <ShieldCheckIcon className="w-3 h-3 mr-1" />
                        Esterilizado
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-lg">
                  {pet.species} • {pet.breed} • {calculateAge(pet.dateOfBirth)}
                </p>
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <PetForm
                isEditing={true}
                initialPet={formatPetForForm(pet)}
                userId={pet.userId}
                onPetUpdated={handlePetUpdated}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Pet Information */}
          <div className="lg:col-span-3 space-y-8">
            {/* Basic Information Card */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileTextIcon className="w-5 h-5 text-blue-600" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {infoItems.map(({ label, value, icon: Icon, color }, index) => (
                    <div key={index} className="group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {label}
                          </p>
                          <p className="text-base font-semibold text-gray-900 break-words">
                            {value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </div>

          {/* Right Column - Status Controls */}
          <div className="space-y-8">
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Estado de la Mascota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <label
                          htmlFor="isNeutered"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Esterilizado/a
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Indica si la mascota ha sido esterilizada o castrada.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="isNeutered"
                      checked={isNeutered}
                      onCheckedChange={handleNeuteredChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <HeartIcon className="w-5 h-5 text-red-600" />
                      <div>
                        <label
                          htmlFor="isDeceased"
                          className="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          Fallecido/a
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Marca si la mascota ha fallecido.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="isDeceased"
                      checked={isDeceased}
                      onCheckedChange={handleDeceasedChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical History - Full Width */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <SyringeIcon className="w-5 h-5 text-red-600" />
                Historial Médico
              </CardTitle>
              <MedicalRecordDialog petId={pet.id} />
            </div>
          </CardHeader>
          <CardContent>
            {pet.medicalHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                      <TableHead className="font-semibold text-gray-700">Razón</TableHead>
                      <TableHead className="font-semibold text-gray-700">Diagnóstico</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tratamiento</TableHead>
                      <TableHead className="font-semibold text-gray-700">Notas</TableHead>
                      <TableHead className="font-semibold text-gray-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.medicalHistory.map((record, index) => (
                      <TableRow key={record.id} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                        <TableCell className="font-medium">
                          {record.visitDate.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.reasonForVisit}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell className="max-w-md">
                          {record.notes || "N/A"}
                        </TableCell>
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
            ) : (
              <div className="text-center py-12">
                <SyringeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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

        {/* Vaccination and Deworming Sections - Full Width */}
        <div className="mt-8 space-y-8">
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
