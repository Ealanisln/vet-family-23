'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from "lucide-react"
import { addMedicalHistory } from '@/app/actions/add-medical-record'

export function AddMedicalRecordDialog() {
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [record, setRecord] = useState({
    visitDate: '',
    reasonForVisit: '',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRecord(prevState => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const petId = params.petId as string
    const recordData = {
      ...record,
      visitDate: new Date(record.visitDate),
      prescriptions: record.prescriptions.split(',').map(p => p.trim())
    }
    const result = await addMedicalHistory(petId, recordData)
    if (result.success) {
      console.log('Nuevo registro médico agregado:', result.record)
      setOpen(false)
      setRecord({ visitDate: '', reasonForVisit: '', diagnosis: '', treatment: '', prescriptions: '', notes: '' })
    } else {
      console.error('Error al agregar el registro médico:', result.error)
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" /> Nueva Consulta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Consulta Médica</DialogTitle>
          <DialogDescription>
            Ingrese los detalles de la nueva consulta médica. Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visitDate" className="text-right">
                Fecha
              </Label>
              <Input
                id="visitDate"
                name="visitDate"
                type="date"
                value={record.visitDate}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reasonForVisit" className="text-right">
                Razón
              </Label>
              <Input
                id="reasonForVisit"
                name="reasonForVisit"
                value={record.reasonForVisit}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="diagnosis" className="text-right">
                Diagnóstico
              </Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={record.diagnosis}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treatment" className="text-right">
                Tratamiento
              </Label>
              <Textarea
                id="treatment"
                name="treatment"
                value={record.treatment}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prescriptions" className="text-right">
                Prescripciones
              </Label>
              <Input
                id="prescriptions"
                name="prescriptions"
                value={record.prescriptions}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Separadas por comas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={record.notes}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Guardar Consulta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}