import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PetPayload {
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

export async function POST(req: NextRequest) {
  console.log("🐾 [ADD-PET-API] Starting pet creation...");
  
  try {
    // 1. Verificar autenticación
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user?.id) {
      console.error("❌ [ADD-PET-API] No authenticated user");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("✅ [ADD-PET-API] User authenticated:", user.email);
    
    // 2. Parsear el body
    const body = await req.json();
    const { userId, petData }: { userId: string; petData: PetPayload } = body;
    
    if (!userId || !petData) {
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
      console.error("❌ [ADD-PET-API] User not found in database:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // 5. Crear la mascota en una transacción
    const processedInternalId = petData.internalId?.trim() || null;
    
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const petId = uuidv4();
      
      const newPet = await tx.pet.create({
        data: {
          id: petId,
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
          User: {
            connect: { id: userId }
          }
        },
        include: {
          MedicalHistory: true,
        },
      });
      
      // Crear historial médico inicial si se proporciona
      if (petData.medicalHistory) {
        await tx.medicalHistory.create({
          data: {
            id: uuidv4(),
            petId: newPet.id,
            visitDate: new Date(),
            reasonForVisit: "Initial check-up",
            diagnosis: "N/A",
            treatment: "N/A",
            notes: petData.medicalHistory,
            prescriptions: [] as string[],
          },
        });
      }
      
      return newPet;
    });
    
    console.log("✅ [ADD-PET-API] Pet created successfully:", result.id);
    
    // 6. Responder con éxito
    return NextResponse.json({
      success: true,
      pet: result,
      redirectUrl: `/admin/clientes/${userId}`
    });
    
  } catch (error) {
    console.error("❌ [ADD-PET-API] Error creating pet:", error);
    
    // Manejar errores de Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: "El ID interno ya existe" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create pet" 
      },
      { status: 500 }
    );
  }
}
