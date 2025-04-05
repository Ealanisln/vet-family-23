// src/types/pet.ts

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

// Esta interfaz coincide con la estructura exacta que devuelve Prisma
export interface PrismaDeworming {
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

export interface Pet {
  id: string;
  userId: string;
  internalId?: string | null;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  isNeutered: boolean;
  microchipNumber: string | null;
  isDeceased: boolean;
  medicalHistory: MedicalHistory[];
  vaccinations: PrismaVaccination[];
}

export interface TablePet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string;
  ownerName: string;
  isDeceased: boolean;
  internalId: string | null;
  dateOfBirth: Date | null; // Allow null
  gender: string;
  weight: number | null; // Allow null
  microchipNumber: string | null;
  isNeutered: boolean | null; // Allow null
}

export interface IDewormingInput {
  dewormingType: string;
  stage: string;
  administrationDate: Date;
  nextDoseDate: Date;
  batchNumber?: string;
  manufacturer?: string;
  veterinarianName?: string;
  notes?: string;
}

export interface IDeworming extends IDewormingInput {
  id: string;
  petId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
