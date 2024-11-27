import { PrismaClient } from '@prisma/client';
import { ObjectId } from 'bson';

const prisma = new PrismaClient();

async function updatePetTimestamps() {
  try {
    // Primero intentar obtener directamente de la colección usando Prisma
    const pets = await prisma.$runCommandRaw({
      find: "Pet",
      filter: {
        $or: [
          { createdAt: { $exists: false } },
          { createdAt: null },
          { updatedAt: { $exists: false } },
          { updatedAt: null }
        ]
      }
    });

    console.log('Database query result:', pets);

    // También intentar obtener usando findMany para comparar
    const allPets = await prisma.pet.findMany({
      select: {
        id: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const problemPets = allPets.filter(pet => {
      const createdAtInvalid = !pet.createdAt || pet.createdAt.toString() === 'Invalid Date';
      const updatedAtInvalid = !pet.updatedAt || pet.updatedAt.toString() === 'Invalid Date';
      return createdAtInvalid || updatedAtInvalid;
    });

    console.log(`Analysis:
- Total pets in database: ${allPets.length}
- Pets with potential timestamp issues: ${problemPets.length}
`);

    if (problemPets.length > 0) {
      console.log('Problem pets:', problemPets.map(p => ({
        id: p.id,
        createdAt: p.createdAt?.toString() || 'null',
        updatedAt: p.updatedAt?.toString() || 'null'
      })));

      // Intentar arreglar los pets con problemas
      for (const pet of problemPets) {
        const now = new Date();
        try {
          await prisma.pet.update({
            where: { id: pet.id },
            data: {
              createdAt: pet.dateOfBirth || now,
              updatedAt: now
            }
          });
          console.log(`Updated timestamps for pet ${pet.id}`);
        } catch (err) {
          console.error(`Failed to update pet ${pet.id}:`, err);
        }
      }

      // Verificación final
      const finalCheck = await prisma.pet.findMany({
        where: {
          id: {
            in: problemPets.map(p => p.id)
          }
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('After updates:', finalCheck);
    }

    // Intentar ejecutar un comando directo de MongoDB para verificar
    const dbCheck = await prisma.$runCommandRaw({
      collStats: "Pet"
    });

    console.log('Collection stats:', dbCheck);

  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updatePetTimestamps()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}