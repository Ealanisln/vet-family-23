import React from 'react';
import VaccinationCard, { IVaccination, VaccineType, VaccinationStage, VaccinationStatus } from './VaccinationDialogCard';

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
  vaccinations: PrismaVaccination[];
}

export function VaccinationContainer({ petId, vaccinations }: VaccinationContainerProps) {
  // Convertir las vacunaciones de Prisma al formato que espera el componente
  const formattedVaccinations: IVaccination[] = vaccinations.map(v => ({
    id: v.id,
    petId: v.petId,
    vaccineType: v.vaccineType as VaccineType,
    // Valores por defecto para los campos que no vienen de Prisma
    stage: "ADULT" as VaccinationStage, // O podrías determinar esto basado en la edad de la mascota
    status: "SCHEDULED" as VaccinationStatus, // O determinarlo basado en las fechas
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
      vaccinations={formattedVaccinations}
    />
  );
}