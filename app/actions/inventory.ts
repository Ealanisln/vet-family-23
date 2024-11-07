// app/actions/inventory.ts
import { prisma } from '@/lib/prismaDB'

// Obtener un medicamento con sus prescripciones
export async function getMedicineWithPrescriptions(id: string) {
  const medicine = await prisma.medicine.findUnique({
    where: { id },
    include: {
      movements: true
    }
  });

  if (!medicine) return null;

  // Obtener las prescripciones relacionadas
  const prescriptions = await prisma.medicalHistory.findMany({
    where: {
      medicineIds: {
        has: id
      }
    }
  });

  return {
    ...medicine,
    prescriptions
  };
}

// Agregar una prescripción
export async function addPrescription(medicineId: string, historyId: string) {
  const [updateMedicine, updateHistory] = await Promise.all([
    // Agregar el ID de la historia al medicamento
    prisma.medicine.update({
      where: { id: medicineId },
      data: {
        prescriptionIds: {
          push: historyId
        }
      }
    }),
    // Agregar el ID del medicamento a la historia
    prisma.medicalHistory.update({
      where: { id: historyId },
      data: {
        medicineIds: {
          push: medicineId
        }
      }
    })
  ]);

  return { updateMedicine, updateHistory };
}

// Obtener historial médico con medicamentos
export async function getMedicalHistoryWithMedicines(historyId: string) {
  const history = await prisma.medicalHistory.findUnique({
    where: { id: historyId }
  });

  if (!history) return null;

  // Obtener los medicamentos relacionados
  const medicines = await prisma.medicine.findMany({
    where: {
      id: {
        in: history.medicineIds
      }
    }
  });

  return {
    ...history,
    medicines
  };
}