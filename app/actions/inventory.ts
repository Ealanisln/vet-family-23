import { prisma } from '@/lib/prismaDB';
import { MedicalHistory, InventoryItem } from '@prisma/client';

// Get medicine with its movements and related prescriptions
export async function getMedicineWithPrescriptions(id: string) {
  const medicine = await prisma.inventoryItem.findUnique({
    where: { 
      id,
      category: 'MEDICINE'  // Ensure we're only getting medicine items
    },
    include: {
      movements: true
    }
  });

  if (!medicine) return null;

  // Get medical histories where this medicine was prescribed
  const prescriptions = await prisma.medicalHistory.findMany({
    where: {
      prescriptions: {
        has: medicine.name // Using medicine name since it's stored in prescriptions array
      }
    },
    include: {
      pet: true // Include pet information for context
    }
  });

  return {
    ...medicine,
    prescriptions
  };
}

// Add a prescription to medical history
export async function addPrescription(
  medicineId: string, 
  historyId: string,
  prescription: string
) {
  // First verify the medicine exists
  const medicine = await prisma.inventoryItem.findUnique({
    where: { 
      id: medicineId,
      category: 'MEDICINE'
    }
  });

  if (!medicine) {
    throw new Error('Medicine not found');
  }

  // Update the medical history with the new prescription
  const updatedHistory = await prisma.medicalHistory.update({
    where: { id: historyId },
    data: {
      prescriptions: {
        push: prescription // Add the prescription details
      }
    }
  });

  // Create an inventory movement to track the prescription
  await prisma.inventoryMovement.create({
    data: {
      itemId: medicineId,
      type: 'OUT',
      quantity: 1, // Adjust based on prescription quantity
      reason: `Prescribed in medical history: ${historyId}`,
      userId: updatedHistory.petId, // You might want to pass the actual userId
      relatedRecordId: historyId
    }
  });

  return updatedHistory;
}

// Get medical history with related medicines
export async function getMedicalHistoryWithMedicines(historyId: string) {
  const history = await prisma.medicalHistory.findUnique({
    where: { id: historyId },
    include: {
      pet: true
    }
  });

  if (!history) return null;

  // Get all medicines mentioned in prescriptions
  const medicines = await prisma.inventoryItem.findMany({
    where: {
      category: 'MEDICINE',
      name: {
        in: history.prescriptions // Assuming prescriptions array contains medicine names
      }
    },
    include: {
      movements: {
        where: {
          relatedRecordId: historyId
        }
      }
    }
  });

  return {
    ...history,
    medicines
  };
}

// Helper function to update inventory quantity
export async function updateMedicineInventory(
  medicineId: string,
  quantity: number,
  type: 'IN' | 'OUT',
  userId: string,
  reason?: string
) {
  const medicine = await prisma.inventoryItem.findUnique({
    where: { id: medicineId }
  });

  if (!medicine) {
    throw new Error('Medicine not found');
  }

  const [updatedInventory, movement] = await prisma.$transaction([
    // Update inventory quantity
    prisma.inventoryItem.update({
      where: { id: medicineId },
      data: {
        quantity: {
          [type === 'IN' ? 'increment' : 'decrement']: Math.abs(quantity)
        },
        status: {
          set: medicine.quantity <= (medicine.minStock || 0) ? 'LOW_STOCK' : 'ACTIVE'
        }
      }
    }),
    // Create movement record
    prisma.inventoryMovement.create({
      data: {
        itemId: medicineId,
        type,
        quantity: Math.abs(quantity),
        userId,
        reason
      }
    })
  ]);

  return { updatedInventory, movement };
}