// scripts/migrations/update-pet-timestamps.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePetTimestamps() {
  try {
    // Primero, obtener todos los IDs de mascotas sin timestamps
    const petsWithoutTimestamps = await prisma.pet.findMany({
      where: {
        OR: [
          { createdAt: null },
          { updatedAt: null }
        ]
      },
      select: {
        id: true,
        dateOfBirth: true // usaremos esto como referencia si existe
      }
    });

    console.log(`Found ${petsWithoutTimestamps.length} pets without timestamps`);

    // Actualizar cada registro individualmente para mayor seguridad
    let updated = 0;
    let errors = 0;

    for (const pet of petsWithoutTimestamps) {
      try {
        // Usar dateOfBirth como referencia si existe, si no, usar la fecha actual
        const referenceDate = pet.dateOfBirth || new Date();

        await prisma.pet.update({
          where: { id: pet.id },
          data: {
            createdAt: referenceDate,
            updatedAt: new Date()
          }
        });
        updated++;

        // Log cada 100 actualizaciones
        if (updated % 100 === 0) {
          console.log(`Updated ${updated} pets...`);
        }
      } catch (error) {
        errors++;
        console.error(`Error updating pet ${pet.id}:`, error);
      }
    }

    console.log(`Migration completed:
      - Total pets processed: ${petsWithoutTimestamps.length}
      - Successfully updated: ${updated}
      - Errors: ${errors}
    `);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  updatePetTimestamps()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}