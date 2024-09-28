'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addMedicalHistory, getPetsForMedicalRecord, PetForMedicalRecord } from '@/app/actions/add-medical-record'
import { useToast } from "@/components/ui/use-toast"

interface MedicalHistory {
  petId: string;
  visitDate: string;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes?: string;
}

interface AddMedicalRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddMedicalRecordDialog: React.FC<AddMedicalRecordDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast()
  const [pets, setPets] = useState<PetForMedicalRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<MedicalHistory>({
    petId: '',
    visitDate: '',
    reasonForVisit: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    notes: ''
  })

  useEffect(() => {
    const fetchPets = async () => {
      const result = await getPetsForMedicalRecord()
      if (result.success) {
        setPets(result.pets)
        setError(null)
      } else {
        console.error('Error fetching pets:', result.error)
        setError('No se pudieron cargar las mascotas. Por favor, intente de nuevo más tarde.')
      }
    }
    fetchPets()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRecord(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setRecord(prevState => ({ ...prevState, petId: value }))
  }

  const handlePrescriptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prescriptions = e.target.value.split('\n').filter(p => p.trim() !== '')
    setRecord(prevState => ({ ...prevState, prescriptions }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addMedicalHistory(record.petId, {
      visitDate: new Date(record.visitDate),
      reasonForVisit: record.reasonForVisit,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescriptions: record.prescriptions,
      notes: record.notes
    })
    if (result.success) {
      console.log('Nuevo historial médico agregado:', result.record)
      toast({
        title: "Éxito",
        description: "El nuevo historial médico ha sido agregado correctamente.",
      })
      onOpenChange(false)
      setRecord({
        petId: '',
        visitDate: '',
        reasonForVisit: '',
        diagnosis: '',
        treatment: '',
        prescriptions: [],
        notes: ''
      })
    } else {
      console.error('Error al agregar el historial médico:', result.error)
      setError('No se pudo agregar el historial médico. Por favor, intente de nuevo.')
      toast({
        title: "Error",
        description: "No se pudo agregar el historial médico. Por favor, intente de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Agregar Nuevo Historial Médico</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Seleccione la mascota e ingrese los detalles del nuevo historial médico. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="text-red-500 mb-4 text-sm sm:text-base">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6">
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="pet" className="sm:text-right text-sm sm:text-base">
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
            <div className="grid sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <Label htmlFor="visitDate" className="sm:text-right text-sm sm:text-base">
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
              <Label htmlFor="reasonForVisit" className="sm:text-right text-sm sm:text-base">
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
              <Label htmlFor="diagnosis" className="sm:text-right text-sm sm:text-base pt-2">
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
              <Label htmlFor="treatment" className="sm:text-right text-sm sm:text-base pt-2">
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
              <Label htmlFor="prescriptions" className="sm:text-right text-sm sm:text-base pt-2">
                Prescripciones
              </Label>
              <Textarea
                id="prescriptions"
                name="prescriptions"
                value={record.prescriptions.join('\n')}
                onChange={handlePrescriptionsChange}
                className="sm:col-span-3"
                rows={3}
                placeholder="Ingrese cada prescripción en una nueva línea"
              />
            </div>
            <div className="grid sm:grid-cols-4 items-start gap-2 sm:gap-4">
              <Label htmlFor="notes" className="sm:text-right text-sm sm:text-base pt-2">
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
            <Button type="submit" className="w-full sm:w-auto">Guardar Historial Médico</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}