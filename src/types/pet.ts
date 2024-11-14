interface MedicalHistory {
    id: string;
    petId: string;
    visitDate: Date;
    reasonForVisit: string;
    diagnosis: string;
    treatment: string;
    prescriptions: string[];
    notes: string | null;
  }
  
  // Esta interfaz coincide con la estructura exacta que devuelve Prisma
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
  
  export interface Pet {
    id: string;
    internalId?: string | null;
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    gender: string;
    weight: number;
    microchipNumber: string | null;
    isNeutered: boolean;
    isDeceased: boolean;
    medicalHistory: MedicalHistory[];
    vaccinations: PrismaVaccination[]; // Usando la interfaz que coincide con Prisma
  }