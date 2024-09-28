'use server'

import { prisma } from '@/lib/prismaDB'
import { revalidatePath } from 'next/cache'

export async function addMedicalRecord(petId: string, recordData: {
  date: string
  reason: string
  diagnosis: string
  treatment: string
  notes: string
}) {
  try {
    const newRecord = await prisma.medicalHistory.create({
      data: {
        petId,
        visitDate: new Date(recordData.date),
        reasonForVisit: recordData.reason,
        diagnosis: recordData.diagnosis,
        treatment: recordData.treatment,
        notes: recordData.notes,
      },
    })

    revalidatePath(`/admin/clientes/[id]/mascotas/${petId}`)
    return { success: true, record: newRecord }
  } catch (error) {
    console.error('Failed to add medical record:', error)
    return { success: false, error: 'Failed to add medical record' }
  }
}