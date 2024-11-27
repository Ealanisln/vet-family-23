// app/actions/get-pet-details.ts
import { prisma } from "@/lib/prismaDB";

export async function getPetDetails(petId: string) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      medicalHistory: true,
      vaccinations: true,
    },
  });

  return pet;
}