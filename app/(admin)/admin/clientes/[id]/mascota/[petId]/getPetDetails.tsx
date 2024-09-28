// File: app/(admin)/admin/clientes/[id]/mascotas/[petId]/getPetDetails.ts

import { prisma } from "@/lib/prismaDB";
import { notFound } from "next/navigation";

export async function getPetDetails(userId: string, petId: string) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      medicalHistory: true,
      vaccinations: true,
    },
  });

  if (!pet || pet.userId !== userId) {
    notFound();
  }

  return pet;
}