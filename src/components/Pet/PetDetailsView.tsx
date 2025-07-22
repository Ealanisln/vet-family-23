// src/components/Pet/PetDetailsView.tsx

"use client";

import React, { useState, useCallback } from "react";
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
  IdCardIcon,
  HeartIcon,
  SyringeIcon,
  ShieldCheckIcon,
  FileTextIcon,
  ZapIcon
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
  MedicalHistory: MedicalHistory[];
  Vaccination: Vaccination[];
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

  if (age === 0) {
    const months =
      today.getMonth() -
      birthDate.getMonth() +
      12 * (today.getFullYear() - birthDate.getFullYear());
    return months <= 1 ? "Menos de 1 mes" : `${months} meses`;
  }

  return `${age} año${age !== 1 ? "s" : ""}`;
};

export default function PetDetailsView({ pet }: { pet: Pet }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [isNeutered, setIsNeutered] = useState(pet.isNeutered);
  const [isDeceased, setIsDeceased] = useState(pet.isDeceased);

  const handleNeuteredChange = useCallback(async (checked: boolean) => {
    setIsNeutered(checked);
    try {
      await updatePetNeuteredStatus(pet.userId, pet.id, checked);
    } catch (error) {
      console.error("Error updating neutered status:", error);
      setIsNeutered(!checked);
    }
  }, [pet.id, pet.userId]);

  const handleDeceasedChange = useCallback(async (checked: boolean) => {
    setIsDeceased(checked);
    try {
      await updatePetDeceasedStatus(pet.userId, pet.id, checked);
    } catch (error) {
      console.error("Error updating deceased status:", error);
      setIsDeceased(!checked);
    }
  }, [pet.id, pet.userId]);

  const handlePetUpdated = useCallback(() => {
    router.refresh();
  }, [router]);

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
        pet.MedicalHistory.length > 0 ? pet.MedicalHistory[0].notes || "" : "",
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
      gradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-200",
      textColor: "text-purple-700"
    },
    { 
      label: "Raza", 
      value: pet.breed, 
      icon: PawPrintIcon,
      gradient: "from-green-50 to-green-100/50",
      iconBg: "bg-green-200",
      textColor: "text-green-700"
    },
    {
      label: "Fecha de Nacimiento",
      value: pet.dateOfBirth.toLocaleDateString(),
      icon: CalendarIcon,
      gradient: "from-amber-50 to-amber-100/50",
      iconBg: "bg-amber-200",
      textColor: "text-amber-700"
    },
    { 
      label: "Edad", 
      value: calculateAge(pet.dateOfBirth), 
      icon: CalendarIcon,
      gradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-200",
      textColor: "text-blue-700"
    },
    { 
      label: "Género", 
      value: pet.gender, 
      icon: HeartIcon,
      gradient: "from-pink-50 to-pink-100/50",
      iconBg: "bg-pink-200",
      textColor: "text-pink-700"
    },
    { 
      label: "Peso", 
      value: `${pet.weight} kg`, 
      icon: ScaleIcon,
      gradient: "from-indigo-50 to-indigo-100/50",
      iconBg: "bg-indigo-200",
      textColor: "text-indigo-700"
    },
    { 
      label: "Número de Microchip", 
      value: pet.microchipNumber || "N/A", 
      icon: ZapIcon,
      gradient: "from-orange-50 to-orange-100/50",
      iconBg: "bg-orange-200",
      textColor: "text-orange-700"
    },
    { 
      label: "ID Interno", 
      value: pet.internalId || "N/A", 
      icon: IdCardIcon,
      gradient: "from-teal-50 to-teal-100/50",
      iconBg: "bg-teal-200",
      textColor: "text-teal-700"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Header Section */}
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
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-xl">
                    <PawPrintIcon className="h-6 w-6 text-white" />
                  </div>
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Pet Information */}
          <div className="lg:col-span-3 space-y-8">
            {/* Basic Information Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <FileTextIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {infoItems.map(({ label, value, icon: Icon, gradient, iconBg, textColor }, index) => (
                    <div key={index} className={`flex items-center gap-3 p-4 bg-gradient-to-r ${gradient} rounded-lg hover:scale-[1.02] transition-transform`}>
                      <div className={`p-2 ${iconBg} rounded-lg`}>
                        <Icon className={`w-4 h-4 ${textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${textColor} mb-1`}>
                          {label}
                        </p>
                        <p className="text-lg font-semibold text-gray-900 break-words">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  Estado de la Mascota
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                        Indica si la mascota está esterilizada.
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical History - Full Width */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <SyringeIcon className="w-5 h-5 text-red-600" />
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
                      <TableHead className="font-semibold text-gray-700">Notas</TableHead>
                      <TableHead className="font-semibold text-gray-700">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pet.MedicalHistory.map((record, index) => (
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
