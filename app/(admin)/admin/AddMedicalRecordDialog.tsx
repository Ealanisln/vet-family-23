// app/(admin)/admin/AddMedicalRecordDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addMedicalHistory,
  updateMedicalHistory,
  getPetsForMedicalRecord,
  PetForMedicalRecord,
} from "@/app/actions/add-medical-record";
import { useToast } from "@/components/ui/use-toast";
import { EditIcon, PlusCircle } from "lucide-react";

interface MedicalHistory {
  id?: string;
  petId: string;
  visitDate: string;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

interface MedicalRecordDialogProps {
  existingRecord?: MedicalHistory;
  petId?: string;
  triggerButton?: React.ReactNode;
}

export const MedicalRecordDialog: React.FC<MedicalRecordDialogProps> = ({
  existingRecord,
  petId,
  triggerButton,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pets, setPets] = useState<PetForMedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<MedicalHistory>({
    id: existingRecord?.id || undefined,
    petId: existingRecord?.petId || petId || "",
    visitDate: existingRecord?.visitDate || "",
    reasonForVisit: existingRecord?.reasonForVisit || "",
    diagnosis: existingRecord?.diagnosis || "",
    treatment: existingRecord?.treatment || "",
    prescriptions: existingRecord?.prescriptions || [],
    notes: existingRecord?.notes || "",
  });

  useEffect(() => {
    const fetchPets = async () => {
      if (!petId && !existingRecord) {
        const result = await getPetsForMedicalRecord();
        if (result.success) {
          // Filter out deceased pets
          const alivePets = result.pets.filter((pet) => !pet.isDeceased);
          setPets(alivePets);
          setError(null);
        } else {
          console.error("Error fetching pets:", result.error);
          setError(
            "No se pudieron cargar las mascotas. Por favor, intente de nuevo más tarde."
          );
        }
      }
    };
    fetchPets();
  }, [petId, existingRecord]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRecord((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setRecord((prevState) => ({ ...prevState, petId: value }));
  };

  const handlePrescriptionsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const prescriptions = e.target.value
      .split("\n")
      .filter((p) => p.trim() !== "");
    setRecord((prevState) => ({ ...prevState, prescriptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = record.id ? updateMedicalHistory : addMedicalHistory;
    const result = await action(record.petId, {
      id: record.id,
      visitDate: new Date(record.visitDate),
      reasonForVisit: record.reasonForVisit,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescriptions: record.prescriptions,
      notes: record.notes,
    });
    if (result.success) {
      console.log(
        record.id
          ? "Historial médico actualizado:"
          : "Nuevo historial médico agregado:",
        result.record
      );
      toast({
        title: "Éxito",
        description: record.id
          ? "El historial médico ha sido actualizado correctamente."
          : "El nuevo historial médico ha sido agregado correctamente.",
      });
      setOpen(false);
    } else {
      console.error("Error al procesar el historial médico:", result.error);
      setError(
        "No se pudo procesar el historial médico. Por favor, intente de nuevo."
      );
      toast({
        title: "Error",
        description:
          "No se pudo procesar el historial médico. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? (
          triggerButton
        ) : existingRecord ? (
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Historial Médico
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {existingRecord
              ? "Editar Historial Médico"
              : "Agregar Nuevo Historial Médico"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {existingRecord
              ? "Modifique los detalles del historial médico. Haga clic en guardar cuando haya terminado."
              : "Ingrese los detalles del nuevo historial médico. Haga clic en guardar cuando haya terminado."}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6">
            {!petId && !existingRecord && (
              <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label
                  htmlFor="pet"
                  className="sm:text-right text-sm sm:text-base"
                >
                  Mascota
                </Label>
                <Select onValueChange={handleSelectChange} value={record.petId}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue placeholder="Seleccione una mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species}) - Dueño: {pet.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label
                htmlFor="visitDate"
                className="sm:text-right text-sm sm:text-base"
              >
                Fecha de Visita
              </Label>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                value={record.visitDate}
                onChange={handleInputChange}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label
                htmlFor="reasonForVisit"
                className="sm:text-right text-sm sm:text-base"
              >
                Razón de Visita
              </Label>
              <Input
                id="reasonForVisit"
                name="reasonForVisit"
                value={record.reasonForVisit}
                onChange={handleInputChange}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="diagnosis"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Diagnóstico
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={record.diagnosis}
                onChange={handleInputChange}
                className="sm:col-span-3"
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="treatment"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Tratamiento
              </Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={record.treatment}
                onChange={handleInputChange}
                className="sm:col-span-3"
                rows={3}
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="prescriptions"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Prescripciones
              </Label>
              <Textarea
                id="prescriptions"
                name="prescriptions"
                value={record.prescriptions.join("\n")}
                onChange={handlePrescriptionsChange}
                className="sm:col-span-3"
                rows={3}
                placeholder="Ingrese cada prescripción en una nueva línea"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label
                htmlFor="notes"
                className="sm:text-right text-sm sm:text-base pt-2"
              >
                Notas
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={record.notes}
                onChange={handleInputChange}
                className="sm:col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full sm:w-auto">
              {existingRecord
                ? "Actualizar Historial Médico"
                : "Guardar Historial Médico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
