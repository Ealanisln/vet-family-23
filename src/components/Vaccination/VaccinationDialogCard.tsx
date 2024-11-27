import React, { useState } from 'react';
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { EditIcon, PlusIcon } from "lucide-react";
import { addVaccination, updateVaccination } from "@/app/actions/vaccination";

// Tipos
export type VaccineType = 
  | "DP_PUPPY"
  | "DHPPI"
  | "DHPPI_L"
  | "DHPPI_RL"
  | "BORDETELLA"
  | "SEXTUPLE"
  | "SEXTUPLE_R"
  | "RABIES";

export type VaccinationStage = "PUPPY" | "ADULT";

export type VaccinationStatus = "PENDING" | "COMPLETED" | "OVERDUE" | "SCHEDULED";

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
  DP_PUPPY: "Doble Puppy",
  DHPPI: "Quíntuple",
  DHPPI_L: "Quíntuple + Leptospira",
  DHPPI_RL: "Quíntuple + Rabia + Leptospira",
  BORDETELLA: "Bordetella",
  SEXTUPLE: "Sextuple (sin rabia)",
  SEXTUPLE_R: "Sextuple con rabia",
  RABIES: "Rabia"
};

// Componente Dialog para agregar/editar vacunaciones
interface VaccinationDialogProps {
  existingVaccination?: IVaccination;
  petId: string;
  onSave: () => void;
}

const VaccinationDialog: React.FC<VaccinationDialogProps> = ({ 
  existingVaccination,
  petId,
  onSave
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vaccination.vaccineType || !vaccination.stage || !vaccination.administrationDate || !vaccination.nextDoseDate) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
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
                  setVaccination(prev => ({...prev, vaccineType: value as VaccineType}))}
                value={vaccination.vaccineType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el tipo de vacuna" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(vaccineTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stage">Etapa</Label>
              <Select
                onValueChange={(value) => 
                  setVaccination(prev => ({...prev, stage: value as VaccinationStage}))}
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
                value={vaccination.administrationDate?.toISOString().split('T')[0]}
                onChange={(e) => setVaccination(prev => ({
                  ...prev,
                  administrationDate: new Date(e.target.value)
                }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextDoseDate">Próxima Dosis</Label>
              <Input
                id="nextDoseDate"
                type="date"
                className="col-span-3"
                value={vaccination.nextDoseDate?.toISOString().split('T')[0]}
                onChange={(e) => setVaccination(prev => ({
                  ...prev,
                  nextDoseDate: new Date(e.target.value)
                }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchNumber">Número de Lote</Label>
              <Input
                id="batchNumber"
                className="col-span-3"
                value={vaccination.batchNumber || ''}
                onChange={(e) => setVaccination(prev => ({
                  ...prev,
                  batchNumber: e.target.value
                }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="veterinarianName">Veterinario</Label>
              <Input
                id="veterinarianName"
                className="col-span-3"
                value={vaccination.veterinarianName || ''}
                onChange={(e) => setVaccination(prev => ({
                  ...prev,
                  veterinarianName: e.target.value
                }))}
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
  vaccinations: IVaccination[];
}

const VaccinationCard: React.FC<VaccinationCardProps> = ({ petId, vaccinations = [] }) => {
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
      SCHEDULED: "Programada"
    };
    return labels[status];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Vacunas</CardTitle>
        <VaccinationDialog petId={petId} onSave={handleSave} />
      </CardHeader>
      <CardContent>
        {vaccinations.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:-mx-6">
            <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vacuna</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Aplicación</TableHead>
                    <TableHead>Próxima Dosis</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Veterinario</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.map((vaccination) => (
                    <TableRow key={vaccination.id}>
                      <TableCell>{vaccineTypeLabels[vaccination.vaccineType]}</TableCell>
                      <TableCell>{vaccination.stage === 'PUPPY' ? 'Cachorro' : 'Adulto'}</TableCell>
                      <TableCell>{vaccination.administrationDate.toLocaleDateString()}</TableCell>
                      <TableCell>{vaccination.nextDoseDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(vaccination.status)}`}>
                          {getStatusLabel(vaccination.status)}
                        </span>
                      </TableCell>
                      <TableCell>{vaccination.veterinarianName || 'N/A'}</TableCell>
                      <TableCell>
                        <VaccinationDialog
                          existingVaccination={vaccination}
                          petId={petId}
                          onSave={handleSave}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No hay vacunas registradas.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default VaccinationCard;