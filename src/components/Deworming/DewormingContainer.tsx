import DewormingCard from './DewormingDialogCard';
// Manual type definitions due to Prisma client export issues
type DewormingType = 'INTERNAL' | 'EXTERNAL' | 'BOTH';
type DewormingStage = 'PUPPY' | 'YOUNG' | 'ADULT' | 'SENIOR';
type DewormingStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

interface PrismaDeworming {
  id: string;
  petId: string;
  dewormingType: string;
  stage: string;
  status: string;
  administrationDate: Date;
  nextDoseDate: Date;
  batchNumber?: string | null;
  manufacturer?: string | null;
  veterinarianName?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DewormingContainerProps {
  petId: string;
  petSpecies: string;
  dewormings: PrismaDeworming[];
}

export function DewormingContainer({ 
  petId, 
  petSpecies, 
  dewormings 
}: DewormingContainerProps) {
  // Convertir las desparasitaciones de Prisma al formato que espera el componente
  const formattedDewormings = dewormings.map(d => ({
    id: d.id,
    petId: d.petId,
    dewormingType: d.dewormingType as DewormingType,
    stage: d.stage as DewormingStage,
    status: d.status as DewormingStatus,
    administrationDate: d.administrationDate,
    nextDoseDate: d.nextDoseDate,
    batchNumber: d.batchNumber ?? undefined,
    manufacturer: d.manufacturer ?? undefined,
    veterinarianName: d.veterinarianName ?? undefined,
    notes: d.notes ?? undefined,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  return (
    <DewormingCard
      petId={petId}
      petSpecies={petSpecies}
      dewormings={formattedDewormings}
    />
  );
} 