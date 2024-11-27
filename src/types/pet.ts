// types/pet.ts

import type { MedicalHistory as PrismaMedicalHistory, 
  vaccinations as PrismaVaccinations, 
  Deworming as PrismaDeworming, 
  medicines as PrismaMedicines } from "@prisma/client";

export interface MedicalHistory extends PrismaMedicalHistory {
  id: string;
  petId: string;
  visitDate: Date;
  reasonForVisit: string;
  diagnosis: string;
  treatment: string;
  prescriptions: string[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vaccination extends PrismaVaccinations {
  id: string;
  petId: string;
  vaccineType: string;
  administrationDate: Date;
  nextDoseDate: Date;
  stage: string;
  status: string;
  batchNumber: string | null;
  manufacturer: string | null;
  veterinarianName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medicine extends PrismaMedicines {
  id: string;
  name: string;
  category: string;
  activeCompound: string | null;
  brand: string | null;
  description: string | null;
  presentation: string | null;
  measure: string | null;
  quantity: number;
  minStock: number | null;
  batchNumber: string | null;
  expirationDate: Date | null;
  location: string | null;
  status: string;
  specialNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deworming extends PrismaDeworming {
  id: string;
  petId: string;
  productId: string;
  applicationDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: Medicine;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  internalId: string | null;
  isNeutered: boolean;
  isDeceased: boolean | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  medicalHistory: MedicalHistory[];
  vaccinations: Vaccination[];
  dewormings: Deworming[];
}

// Esta interfaz podría extenderse si necesitamos datos adicionales
// que no están en el modelo base de Pet
export interface PetWithDetails extends Pet {
  // Aquí podrías agregar campos adicionales si los necesitas
  // Por ahora es idéntica a Pet ya que todos los campos relacionados
  // ya están incluidos en la interfaz base
}