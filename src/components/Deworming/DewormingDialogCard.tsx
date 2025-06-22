"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDeworming, updateDeworming } from "@/app/actions/deworming";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Shield } from "lucide-react";
import { IDewormingInput, IDeworming } from "@/types/pet";
import { useToast } from "@/components/ui/use-toast";

const dewormingTypeLabels: Record<string, string> = {
  INTERNAL: "Interno",
  EXTERNAL: "Externo",
  BOTH: "Interno y Externo",
};

interface DewormingDialogProps {
  existingDeworming?: IDeworming;
  petId: string;
  petSpecies: string;
  onSave: () => void;
}

const DewormingDialog: React.FC<DewormingDialogProps> = ({
  existingDeworming,
  petId,
  onSave,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deworming, setDeworming] = useState<IDewormingInput>(() => {
    if (existingDeworming) {
      return {
        dewormingType: existingDeworming.dewormingType,
        stage: existingDeworming.stage,
        administrationDate: existingDeworming.administrationDate,
        nextDoseDate: existingDeworming.nextDoseDate,
        batchNumber: existingDeworming.batchNumber,
        manufacturer: existingDeworming.manufacturer,
        veterinarianName: existingDeworming.veterinarianName,
        notes: existingDeworming.notes,
      };
    }
    return {
      dewormingType: "INTERNAL",
      stage: "ADULT",
      administrationDate: new Date(),
      nextDoseDate: new Date(),
      batchNumber: "",
      manufacturer: "",
      veterinarianName: "",
      notes: "",
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = existingDeworming
        ? await updateDeworming(existingDeworming.id, deworming)
        : await addDeworming(petId, deworming);

      if (result.success) {
        toast({
          title: existingDeworming
            ? "Desparasitación actualizada"
            : "Desparasitación agregada",
          description: "La operación se completó exitosamente.",
        });
        setOpen(false);
        onSave();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingDeworming ? "outline" : "default"} size="sm">
          {existingDeworming ? "Editar" : "Agregar Desparasitación"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {existingDeworming
              ? "Editar Desparasitación"
              : "Agregar Nueva Desparasitación"}
          </DialogTitle>
          <DialogDescription>
            Complete los detalles de la desparasitación
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dewormingType">Tipo</Label>
              <Select
                onValueChange={(value) =>
                  setDeworming((prev) => ({
                    ...prev,
                    dewormingType: value as string,
                  }))
                }
                value={deworming.dewormingType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dewormingTypeLabels).map(([key, label]) => (
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
                  setDeworming((prev) => ({
                    ...prev,
                    stage: value as string,
                  }))
                }
                value={deworming.stage}
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
                value={format(
                  new Date(deworming.administrationDate),
                  "yyyy-MM-dd"
                )}
                onChange={(e) =>
                  setDeworming((prev) => ({
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
                value={format(new Date(deworming.nextDoseDate), "yyyy-MM-dd")}
                onChange={(e) =>
                  setDeworming((prev) => ({
                    ...prev,
                    nextDoseDate: new Date(e.target.value),
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="batchNumber">Número de Lote</Label>
              <Input
                id="batchNumber"
                className="col-span-3"
                value={deworming.batchNumber}
                onChange={(e) =>
                  setDeworming((prev) => ({
                    ...prev,
                    batchNumber: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="manufacturer">Fabricante</Label>
              <Input
                id="manufacturer"
                className="col-span-3"
                value={deworming.manufacturer}
                onChange={(e) =>
                  setDeworming((prev) => ({
                    ...prev,
                    manufacturer: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="veterinarianName">Veterinario</Label>
              <Input
                id="veterinarianName"
                className="col-span-3"
                value={deworming.veterinarianName}
                onChange={(e) =>
                  setDeworming((prev) => ({
                    ...prev,
                    veterinarianName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                className="col-span-3"
                value={deworming.notes}
                onChange={(e) =>
                  setDeworming((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {existingDeworming ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DewormingCardProps {
  petId: string;
  petSpecies: string;
  dewormings: IDeworming[];
}

const DewormingCard: React.FC<DewormingCardProps> = ({
  petId,
  petSpecies,
  dewormings = [],
}) => {
  const handleSave = () => {
    // Recargar los datos de desparasitación
  };

  const getStatusBadgeColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
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
            <Shield className="w-5 h-5 text-blue-600" />
            Desparasitaciones
          </CardTitle>
          <DewormingDialog
            petId={petId}
            petSpecies={petSpecies}
            onSave={handleSave}
          />
        </div>
      </CardHeader>
      <CardContent>
        {dewormings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Etapa</TableHead>
                  <TableHead className="font-semibold text-gray-700">Aplicación</TableHead>
                  <TableHead className="font-semibold text-gray-700">Próxima Dosis</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Veterinario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dewormings.map((deworming, index) => (
                  <TableRow key={deworming.id} className={index % 2 === 0 ? "bg-gray-50/50" : ""}>
                    <TableCell className="font-medium">
                      {dewormingTypeLabels[deworming.dewormingType as string]}
                    </TableCell>
                    <TableCell>
                      {deworming.stage === "PUPPY" ? "Cachorro" : "Adulto"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(deworming.administrationDate), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(deworming.nextDoseDate), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeColor(
                          deworming.status as string
                        )}
                      >
                        {getStatusLabel(deworming.status as string)}
                      </Badge>
                    </TableCell>
                    <TableCell>{deworming.veterinarianName || "-"}</TableCell>
                    <TableCell>
                      <DewormingDialog
                        existingDeworming={deworming}
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
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No hay registros de desparasitación
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Las desparasitaciones aparecerán aquí una vez que se agreguen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DewormingCard; 