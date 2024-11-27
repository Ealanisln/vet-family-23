import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAllPetDates() {
  try {
    // Actualizar todas las fechas usando la sintaxis correcta de MongoDB
    const result = await prisma.pet.updateMany({
      where: {
        OR: [
          { createdAt: { equals: new Date('1970-01-01') } },
          { updatedAt: { equals: new Date('1970-01-01') } },
          { dateOfBirth: { equals: new Date('1970-01-01') } }
        ]
      } as Prisma.PetWhereInput,
      data: {
        createdAt: new Date(),
        updatedAt: new Date(),
        dateOfBirth: new Date()
      }
    });

    // También intentamos una actualización más específica
    await prisma.pet.updateMany({
      where: {
        OR: [
          { createdAt: { lt: new Date('2000-01-01') } },
          { updatedAt: { lt: new Date('2000-01-01') } },
          { dateOfBirth: { lt: new Date('2000-01-01') } }
        ]
      } as Prisma.PetWhereInput,
      data: {
        createdAt: new Date(),
        updatedAt: new Date(),
        dateOfBirth: new Date()
      }
    });

    const updatedPets = await prisma.pet.findMany({
      where: {
        OR: [
          { createdAt: { lt: new Date('2000-01-01') } },
          { updatedAt: { lt: new Date('2000-01-01') } },
          { dateOfBirth: { lt: new Date('2000-01-01') } }
        ]
      } as Prisma.PetWhereInput,
      select: {
        id: true
      }
    });

    // Actualizar cada mascota individualmente si es necesario
    for (const pet of updatedPets) {
      await prisma.pet.update({
        where: { id: pet.id },
        data: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dateOfBirth: new Date()
        }
      });
    }

    console.log(`Registros procesados: ${result.count + updatedPets.length}`);
    return result.count + updatedPets.length;
  } catch (error) {
    console.error('Error en la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la migración
fixAllPetDates()
  .then((count) => {
    console.log(`Migración completada. ${count} registros actualizados`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error durante la migración:', error);
    process.exit(1);
  });