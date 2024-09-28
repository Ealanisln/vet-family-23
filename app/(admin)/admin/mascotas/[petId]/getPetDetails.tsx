import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";

export async function getPetDetails(petId: string) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      medicalHistory: true,
      vaccinations: true,
    },
  });

  if (!pet) {
    notFound();
  }

  return pet;
}