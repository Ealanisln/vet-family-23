// src/scripts/migration/index.ts
import { PrismaClient } from '@prisma/client';
import { chunk } from 'lodash';

// Definimos los tipos que necesitamos
type User = {
  id: string;
  kindeId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  preferredContactMethod: string | null;
  pet: string | null;
  visits: number;
  nextVisitFree: boolean;
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userRoles: Array<any>;
  pets: Array<any>;
  visitHistory: Array<any>;
  appointments: Array<any>;
  billings: Array<any>;
  reminders: Array<any>;
};

type Pet = {
  id: string;
  internalId: string | null;
  userId: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  gender: string;
  weight: number;
  microchipNumber: string | null;
  isNeutered: boolean;
  isDeceased: boolean;
  medicalHistory: Array<any>;
  vaccinations: Array<any>;
  appointments: Array<any>;
  VaccinationSchedule: Array<any>;
};

// Definimos los enums igual que en el schema de Prisma
enum InventoryCategory {
  MEDICINE = 'MEDICINE',
  SURGICAL_MATERIAL = 'SURGICAL_MATERIAL',
  VACCINE = 'VACCINE',
  FOOD = 'FOOD',
  ACCESSORY = 'ACCESSORY',
  CONSUMABLE = 'CONSUMABLE'
}

enum InventoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED'
}

type InventoryItem = {
  id: string;
  name: string;
  category: string; // Mantenemos como string para la lectura de MongoDB
  description: string | null;
  activeCompound: string | null;
  presentation: string | null;
  measure: string | null;
  brand: string | null;
  quantity: number;
  minStock: number | null;
  location: string | null;
  expirationDate: Date | null;
  status: string; // Mantenemos como string para la lectura de MongoDB
  batchNumber: string | null;
  specialNotes: string | null;
  movements: Array<any>;
  createdAt: Date;
  updatedAt: Date;
};

// Inicializamos los clientes de Prisma con las diferentes URLs
const mongoPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MONGODB_URL
    }
  }
});

const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRESQL_URL
    }
  }
});

async function migrateUsers() {
  console.log('Iniciando migración de usuarios...');
  const users = await mongoPrisma.user.findMany({
    include: {
      userRoles: true,
      pets: true,
      visitHistory: true,
      appointments: true,
      billings: true,
      reminders: true,
    }
  }) as unknown as User[];

  const batches = chunk(users, 100);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(async (user: User) => {
        try {
          await postgresPrisma.user.create({
            data: {
              id: user.id,
              kindeId: user.kindeId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              name: user.name,
              phone: user.phone,
              address: user.address,
              preferredContactMethod: user.preferredContactMethod,
              pet: user.pet,
              visits: user.visits,
              nextVisitFree: user.nextVisitFree,
              lastVisit: user.lastVisit,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            }
          });
        } catch (error) {
          console.error(`Error migrando usuario ${user.id}:`, error);
        }
      })
    );
  }
  console.log('Migración de usuarios completada');
}

async function migratePets() {
  console.log('Iniciando migración de mascotas...');
  const pets = await mongoPrisma.pet.findMany({
    include: {
      medicalHistory: true,
      vaccinations: true,
      appointments: true,
      VaccinationSchedule: true
    }
  }) as unknown as Pet[];

  const batches = chunk(pets, 100);

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (pet: Pet) => {
        try {
          await postgresPrisma.pet.create({
            data: {
              id: pet.id,
              internalId: pet.internalId,
              userId: pet.userId,
              name: pet.name,
              species: pet.species,
              breed: pet.breed,
              dateOfBirth: pet.dateOfBirth,
              gender: pet.gender,
              weight: pet.weight,
              microchipNumber: pet.microchipNumber,
              isNeutered: pet.isNeutered,
              isDeceased: pet.isDeceased
            }
          });
        } catch (error) {
          console.error(`Error migrando mascota ${pet.id}:`, error);
        }
      })
    );
  }
  console.log('Migración de mascotas completada');
}

async function migrateInventory() {
  console.log('Iniciando migración de inventario...');
  const items = await mongoPrisma.inventoryItem.findMany({
    include: {
      movements: true
    }
  }) as unknown as InventoryItem[];

  const batches = chunk(items, 50);

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (item: InventoryItem) => {
        try {
          await postgresPrisma.inventoryItem.create({
            data: {
              id: item.id,
              name: item.name,
              category: item.category as InventoryCategory,
              description: item.description,
              activeCompound: item.activeCompound,
              presentation: item.presentation,
              measure: item.measure,
              brand: item.brand,
              quantity: item.quantity,
              minStock: item.minStock,
              location: item.location,
              expirationDate: item.expirationDate,
              status: item.status as InventoryStatus,
              batchNumber: item.batchNumber,
              specialNotes: item.specialNotes,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }
          });
        } catch (error) {
          console.error(`Error migrando item ${item.id}:`, error);
        }
      })
    );
  }
  console.log('Migración de inventario completada');
}

async function runMigration() {
  try {
    console.log('Iniciando proceso de migración...');
    
    // Migrar en orden para mantener integridad referencial
    await migrateUsers();
    await migratePets();
    await migrateInventory();
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    await mongoPrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

export { runMigration };