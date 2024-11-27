import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";
import { Prisma, Pet, MedicalHistory, vaccinations, Deworming, medicines } from "@prisma/client";

interface PetWithDetails extends Pet {
  medicalHistory: MedicalHistory[];
  vaccinations: vaccinations[];
  dewormings: (Deworming & {
    product: medicines;
  })[];
}

async function fixPetDates(petId: string) {
  try {
    // Primero intentamos actualizar directamente sin verificar
    const now = new Date();
    await prisma.pet.update({
      where: { id: petId },
      data: {
        createdAt: {
          set: now
        },
        updatedAt: {
          set: now
        },
        dateOfBirth: {
          set: now
        }
      },
    });
  } catch (error) {
    console.error('Error al corregir las fechas:', error);
    // No propagamos el error para permitir que la operación principal continúe
  }
}

export async function getPetDetails(petId: string): Promise<PetWithDetails> {
  if (!petId || !petId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('ID de mascota inválido');
  }

  try {
    // Primero intentamos corregir las fechas
    await fixPetDates(petId);

    // Luego hacemos la consulta principal
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        medicalHistory: {
          orderBy: {
            visitDate: 'desc',
          },
        },
        vaccinations: {
          orderBy: {
            administrationDate: 'desc',
          },
        },
        dewormings: {
          include: {
            product: true,
          },
          orderBy: {
            applicationDate: 'desc',
          }
        }
      }
    });

    if (!pet) {
      notFound();
    }

    const now = new Date();
    
    // Función auxiliar para garantizar fechas válidas
    const ensureValidDate = (date: Date | null | undefined): Date => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return now;
      }
      return date;
    };

    // Procesamos el objeto final con manejo seguro de fechas
    const processedPet: PetWithDetails = {
      ...pet,
      createdAt: ensureValidDate(pet.createdAt),
      updatedAt: ensureValidDate(pet.updatedAt),
      dateOfBirth: ensureValidDate(pet.dateOfBirth),
      medicalHistory: pet.medicalHistory.map(history => ({
        ...history,
        visitDate: ensureValidDate(history.visitDate),
        createdAt: ensureValidDate(history.createdAt),
        updatedAt: ensureValidDate(history.updatedAt)
      })),
      vaccinations: pet.vaccinations.map(vaccination => ({
        ...vaccination,
        administrationDate: ensureValidDate(vaccination.administrationDate),
        nextDoseDate: ensureValidDate(vaccination.nextDoseDate),
        createdAt: ensureValidDate(vaccination.createdAt),
        updatedAt: ensureValidDate(vaccination.updatedAt)
      })),
      dewormings: pet.dewormings.map(deworming => ({
        ...deworming,
        applicationDate: ensureValidDate(deworming.applicationDate),
        createdAt: ensureValidDate(deworming.createdAt),
        updatedAt: ensureValidDate(deworming.updatedAt),
        product: {
          ...deworming.product,
          createdAt: ensureValidDate(deworming.product.createdAt),
          updatedAt: ensureValidDate(deworming.product.updatedAt),
          expirationDate: deworming.product.expirationDate ? 
            ensureValidDate(deworming.product.expirationDate) : null
        }
      }))
    };

    return processedPet;

  } catch (error) {
    console.error('Error completo:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // En caso de error de Prisma, intentamos una última vez con una consulta más básica
      try {
        const basicPet = await prisma.pet.findUnique({
          where: { id: petId },
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            gender: true,
            isNeutered: true,
            weight: true,
            microchipNumber: true,
            internalId: true,
            isDeceased: true,
            userId: true
          }
        });

        if (!basicPet) {
          notFound();
        }

        // Creamos un objeto con los datos básicos y fechas por defecto
        const now = new Date();
        return {
          ...basicPet,
          createdAt: now,
          updatedAt: now,
          dateOfBirth: now,
          medicalHistory: [],
          vaccinations: [],
          dewormings: []
        } as PetWithDetails;

      } catch (innerError) {
        console.error('Error en la consulta básica:', innerError);
        throw new Error('No se pudo recuperar la información de la mascota');
      }
    }
    
    // Para otros tipos de errores
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al procesar los datos: ${errorMessage}`);
  }
}