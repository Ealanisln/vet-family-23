"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { EditIcon, PlusIcon, Syringe } from "lucide-react";
import { addVaccination, updateVaccination } from "@/app/actions/vaccination";
import {
  isFelineVaccine,
  isCanineVaccine,
  type VaccineType,
} from "@/utils/vaccines";

export type VaccinationStage = "PUPPY" | "ADULT";

export type VaccinationStatus =
  | "PENDING"
  | "COMPLETED"
  | "OVERDUE"
  | "SCHEDULED";

export interface IVaccination {
  id: string;
  petId: string;
  vaccineType: VaccineType;
  stage: VaccinationStage;
  administrationDate: Date;
  nextDoseDate: Date;
  status: VaccinationStatus;
  batchNumber?: string | null;
  manufacturer?: string | null;
  veterinarianName?: string | null;
  notes?: string | null;
}

export interface IVaccinationInput {
  vaccineType?: VaccineType;
  stage?: VaccinationStage;
  administrationDate?: Date;
  nextDoseDate?: Date;
  batchNumber?: string;
  manufacturer?: string;
  veterinarianName?: string;
  notes?: string;
}

const vaccineTypeLabels: Record<VaccineType, string> = {
  // Vacunas caninas
  DP_PUPPY: "Doble Puppy",
  DHPPI: "Quíntuple",
  DHPPI_L: "Quíntuple + Leptospira",
  DHPPI_RL: "Quíntuple + Rabia + Leptospira",
  BORDETELLA: "Bordetella",
  SEXTUPLE: "Sextuple (sin rabia)",
  SEXTUPLE_R: "Sextuple con rabia",
  RABIES: "Rabia",
  // Vacunas felinas
  TRIPLE_FELINA: "Triple Felina",
  LEUCEMIA_FELINA: "Leucemia Felina",
  RABIA_FELINA: "Rabia Felina",
};

// Componente Dialog para agregar/editar vacunaciones
interface VaccinationDialogProps {
  existingVaccination?: IVaccination;
  petId: string;
  petSpecies: string; // Añadir especie de la mascota como prop
  onSave: () => void;
}

const VaccinationDialog: React.FC<VaccinationDialogProps> = ({
  existingVaccination,
  petId,
  petSpecies,
  onSave,
}) => {
  const [open, setOpen] = useState(false);
  const [vaccination, setVaccination] = useState<IVaccinationInput>(() => {
    if (existingVaccination) {
      return {
        vaccineType: existingVaccination.vaccineType,
        stage: existingVaccination.stage,
        administrationDate: existingVaccination.administrationDate,
        nextDoseDate: existingVaccination.nextDoseDate,
        batchNumber: existingVaccination.batchNumber || undefined,
        manufacturer: existingVaccination.manufacturer || undefined,
        veterinarianName: existingVaccination.veterinarianName || undefined,
        notes: existingVaccination.notes || undefined,
      };
    }
    return {
      stage: "PUPPY",
      vaccineType: undefined,
      administrationDate: undefined,
      nextDoseDate: undefined,
    };
  });

  const availableVaccines = Object.entries(vaccineTypeLabels).filter(
    ([type]) => {
      if (
        petSpecies.toLowerCase() === "gato" ||
        petSpecies.toLowerCase() === "felino"
      ) {
        return isFelineVaccine(type as VaccineType);
      }
      return isCanineVaccine(type as VaccineType);
    }
  );

  const validateDates = (
    administrationDate: Date | undefined,
    nextDoseDate: Date | undefined
  ) => {
    const errors: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas

    if (administrationDate) {
      const adminDate = new Date(administrationDate);
      adminDate.setHours(0, 0, 0, 0);

      // Validar que la fecha de administración no sea futura
      if (adminDate > today) {
        errors.push("La fecha de administración no puede ser futura");
      }

      // Validar que la fecha de administración no sea muy antigua (ejemplo: más de 20 años)
      const maxPastDate = new Date();
      maxPastDate.setFullYear(maxPastDate.getFullYear() - 20);
      if (adminDate < maxPastDate) {
        errors.push("La fecha de administración parece ser demasiado antigua");
      }

      // Si también tenemos fecha de próxima dosis, validar la relación entre ambas
      if (nextDoseDate) {
        const nextDate = new Date(nextDoseDate);
        nextDate.setHours(0, 0, 0, 0);

        if (nextDate <= adminDate) {
          errors.push(
            "La fecha de próxima dosis debe ser posterior a la fecha de administración"
          );
        }

        // Validar que la próxima dosis no esté muy lejos en el futuro (ejemplo: más de 3 años)
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 3);
        if (nextDate > maxFutureDate) {
          errors.push(
            "La fecha de próxima dosis parece estar demasiado lejos en el futuro"
          );
        }
      }
    }

    return errors;
  };

  // En el componente VaccinationDialog, actualizar el handleSubmit:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !vaccination.vaccineType ||
      !vaccination.stage ||
      !vaccination.administrationDate ||
      !vaccination.nextDoseDate
    ) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    // Validar fechas
    const dateErrors = validateDates(
      vaccination.administrationDate,
      vaccination.nextDoseDate
    );
    if (dateErrors.length > 0) {
      toast({
        title: "Error de validación",
        description: (
          <div className="space-y-2">
            <p>Se encontraron los siguientes errores:</p>
            <ul className="list-disc pl-4">
              {dateErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    try {
      const result = existingVaccination
        ? await updateVaccination(existingVaccination.id, vaccination)
        : await addVaccination(petId, vaccination);

      if (result.success) {
        toast({
          title: "Éxito",
          description: existingVaccination
            ? "Vacunación actualizada correctamente"
            : "Nueva vacunación registrada correctamente",
        });
        setOpen(false);
        onSave();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la vacunación",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existingVaccination ? (
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Nueva Vacuna
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingVaccination ? "Editar Vacunación" : "Nueva Vacunación"}
          </DialogTitle>
          <DialogDescription>
            {existingVaccination
              ? "Modifique los detalles de la vacunación"
              : "Ingrese los detalles de la nueva vacunación"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vaccineType">Tipo de Vacuna</Label>
              <Select
                onValueChange={(value) =>
                  setVaccination((prev) => ({
                    ...prev,
                    vaccineType: value as VaccineType,
                  }))
                }
                value={vaccination.vaccineType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el tipo de vacuna" />
                </SelectTrigger>
                <SelectContent>
                  {availableVaccines.map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stage">Etapa</Label>
              <Select
                onValueChange={(value) =>
                  setVaccination((prev) => ({
                    ...prev,
                    stage: value as VaccinationStage,
                  }))
                }
                value={vaccination.stage}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione la etapa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUPPY">Cachorro</SelectItem>
                  <SelectItem value="ADULT">Adulto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="administrationDate">Fecha de Aplicación</Label>
              <Input
                id="administrationDate"
                type="date"
                className="col-span-3"
                value={
                  vaccination.administrationDate?.toISOString().split("T")[0]
                }
                onChange={(e) =>
                  setVaccination((prev) => ({
                    ...prev,
                    administrationDate: new Date(e.target.value),
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextDoseDate">Próxima Dosis</Label>
              <Input
                id="nextDoseDate"
                type="date"
                className="col-span-3"
                value={vaccination.nextDoseDate?.toISOString().split("T")[0]}
                min={
                  vaccination.administrationDate
                    ? new Date(
                        vaccination.administrationDate.getTime() + 86400000
                      )
                        .toISOString()
                        .split("T")[0]
                    : undefined
                }
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setVaccination((prev) => ({
                    ...prev,
                    nextDoseDate: newDate,
                  }));

                  // Validar inmediatamente la nueva fecha
                  const dateErrors = validateDates(
                    vaccination.administrationDate,
                    newDate
                  );
                  if (dateErrors.length > 0) {
                    toast({
                      title: "Advertencia",
                      description: dateErrors[0],
                      variant: "destructive",
                    });
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchNumber">Número de Lote</Label>
              <Input
                id="batchNumber"
                className="col-span-3"
                value={vaccination.batchNumber || ""}
                onChange={(e) =>
                  setVaccination((prev) => ({
                    ...prev,
                    batchNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="veterinarianName">Veterinario</Label>
              <Input
                id="veterinarianName"
                className="col-span-3"
                value={vaccination.veterinarianName || ""}
                onChange={(e) =>
                  setVaccination((prev) => ({
                    ...prev,
                    veterinarianName: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {existingVaccination ? "Actualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal de la tarjeta de vacunaciones
interface VaccinationCardProps {
  petId: string;
  petSpecies: string;
  vaccinations: IVaccination[];
}

const VaccinationCard: React.FC<VaccinationCardProps> = ({
  petId,
  petSpecies,
  vaccinations = [],
}) => {
  const handleSave = () => {
    // Recargar los datos de vacunación
  };

  const getStatusBadgeColor = (status: VaccinationStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: VaccinationStatus) => {
    const labels: Record<VaccinationStatus, string> = {
      COMPLETED: "Completada",
      PENDING: "Pendiente",
      OVERDUE: "Vencida",
      SCHEDULED: "Programada",
    };
    return labels[status];
  };

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Syringe className="w-5 h-5 text-green-600" />
            Vacunas
          </CardTitle>
          <VaccinationDialog
            petId={petId}
            petSpecies={petSpecies}
            onSave={handleSave}
          />
        </div>
      </CardHeader>
      <CardContent>
        {vaccinations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-700">Vacuna</TableHead>
                  <TableHead className="font-semibold text-gray-700">Etapa</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aplicación</TableHead>
                  <TableHead className="font-semibold text-gray-700">Próxima Dosis</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Veterinario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaccinations.map((vaccination, index) => (
                  <TableRow key={vaccination.id} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                    <TableCell className="font-medium">
                      {vaccineTypeLabels[vaccination.vaccineType]}
                    </TableCell>
                    <TableCell>
                      {vaccination.stage === "PUPPY" ? "Cachorro" : "Adulto"}
                    </TableCell>
                    <TableCell>
                      {vaccination.administrationDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {vaccination.nextDoseDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(vaccination.status)}`}
                      >
                        {getStatusLabel(vaccination.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vaccination.veterinarianName || "N/A"}
                    </TableCell>
                    <TableCell>
                      <VaccinationDialog
                        existingVaccination={vaccination}
                        petId={petId}
                        petSpecies={petSpecies}
                        onSave={handleSave}
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
              No hay vacunas registradas.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Las vacunas aparecerán aquí una vez que se agreguen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VaccinationCard;
