// src/components/Vaccination/VaccinationContainer.tsx

import VaccinationCard from './VaccinationDialogCard';
import type { IVaccination } from './VaccinationDialogCard';
import type { VaccineType } from '@/utils/vaccines'; // Importar desde utils
// Manual type definitions due to Prisma client export issues
const VaccinationStage = {
  PUPPY: 'PUPPY' as const,
  ADULT: 'ADULT' as const,
};

const VaccinationStatus = {
  PENDING: 'PENDING' as const,
  COMPLETED: 'COMPLETED' as const,
  OVERDUE: 'OVERDUE' as const,
  SCHEDULED: 'SCHEDULED' as const,
};

// Esta interfaz debe coincidir exactamente con la forma de los datos que vienen de Prisma
interface PrismaVaccination {
  id: string;
  petId: string;
  vaccineType: string;
  administrationDate: Date;
  nextDoseDate: Date;
  batchNumber?: string | null;
  manufacturer?: string | null;
  veterinarianName?: string | null;
  notes?: string | null;
}

interface VaccinationContainerProps {
  petId: string;
  petSpecies: string;
  vaccinations: PrismaVaccination[];
}

export function VaccinationContainer({ 
  petId, 
  petSpecies, 
  vaccinations 
}: VaccinationContainerProps) {
  // Convertir las vacunaciones de Prisma al formato que espera el componente
  const formattedVaccinations: IVaccination[] = vaccinations.map(v => ({
    id: v.id,
    petId: v.petId,
    vaccineType: v.vaccineType as VaccineType,
    // Valores por defecto para los campos que no vienen de Prisma
    stage: "ADULT" as typeof VaccinationStage[keyof typeof VaccinationStage], // O podrías determinar esto basado en la edad de la mascota
    status: "SCHEDULED" as typeof VaccinationStatus[keyof typeof VaccinationStatus], // O determinarlo basado en las fechas
    administrationDate: v.administrationDate,
    nextDoseDate: v.nextDoseDate,
    batchNumber: v.batchNumber,
    manufacturer: v.manufacturer,
    veterinarianName: v.veterinarianName,
    notes: v.notes,
  }));

  return (
    <VaccinationCard
      petId={petId}
      petSpecies={petSpecies}
      vaccinations={formattedVaccinations}
    />
  );
}