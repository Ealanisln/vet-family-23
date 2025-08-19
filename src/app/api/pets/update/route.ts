import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PetUpdatePayload {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string; // ISO string from client
  gender: string;
  weight: number;
  microchipNumber?: string;
  medicalHistory?: string;
  isNeutered: boolean;
  isDeceased?: boolean;
  internalId?: string;
}

export async function PUT(req: NextRequest) {
  console.log("🐾 [UPDATE-PET-API] Starting pet update...");
  
  try {
    // 1. Verificar autenticación
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      console.error("❌ [UPDATE-PET-API] No authenticated user");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("✅ [UPDATE-PET-API] User authenticated:", user.email);
    
    // 2. Parsear el body
    const body = await req.json();
    const { userId, petData }: { userId: string; petData: PetUpdatePayload } = body;
    
    if (!userId || !petData || !petData.id) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }
    
    // 3. Validar datos
    if (!petData.name || !petData.species || !petData.breed) {
      return NextResponse.json(
        { success: false, error: "Missing required pet fields" },
        { status: 400 }
      );
    }
    
    if (isNaN(petData.weight) || petData.weight <= 0) {
      return NextResponse.json(
        { success: false, error: "El peso debe ser un número válido mayor que 0" },
        { status: 400 }
      );
    }
    
    // 4. Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!userExists) {
      console.error("❌ [UPDATE-PET-API] User not found in database:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // 5. Verificar que la mascota existe y pertenece al usuario
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petData.id,
        userId: userId
      }
    });
    
    if (!existingPet) {
      console.error("❌ [UPDATE-PET-API] Pet not found or doesn't belong to user");
      return NextResponse.json(
        { success: false, error: "Pet not found" },
        { status: 404 }
      );
    }
    
    // 6. Actualizar la mascota en una transacción
    const processedInternalId = petData.internalId?.trim() || null;
    
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedPet = await tx.pet.update({
        where: { id: petData.id },
        data: {
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          dateOfBirth: new Date(petData.dateOfBirth),
          gender: petData.gender,
          weight: petData.weight,
          microchipNumber: petData.microchipNumber || null,
          isNeutered: petData.isNeutered,
          isDeceased: petData.isDeceased || false,
          internalId: processedInternalId,
        },
        include: {
          MedicalHistory: true,
        },
      });
      
      // Crear historial médico si se proporciona
      if (petData.medicalHistory && petData.medicalHistory.trim()) {
        await tx.medicalHistory.create({
          data: {
            id: uuidv4(),
            petId: updatedPet.id,
            visitDate: new Date(),
            reasonForVisit: "Update check-up",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
            prescriptions: [] as string[],
          },
        });
      }
      
      return updatedPet;
    });
    
    console.log("✅ [UPDATE-PET-API] Pet updated successfully:", result.id);
    
    // 7. Responder con éxito
    return NextResponse.json({
      success: true,
      pet: result,
      redirectUrl: `/admin/clientes/${userId}`
    });
    
  } catch (error) {
    console.error("❌ [UPDATE-PET-API] Error updating pet:", error);
    
    // Manejar errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: "El ID interno ya existe" },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: "La mascota no fue encontrada" },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update pet" 
      },
      { status: 500 }
    );
  }
}
