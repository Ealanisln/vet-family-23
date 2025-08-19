import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prismaDB";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface PetPayload {
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  gender: string;
  weight: number;
  microchipNumber?: string;
  medicalHistory?: string;
  isNeutered: boolean;
  isDeceased?: boolean;
  internalId?: string;
}

// Función para crear un token temporal
function createTempToken(userId: string): string {
  const timestamp = Date.now();
  return Buffer.from(JSON.stringify({ userId, timestamp })).toString('base64');
}

export async function POST(req: NextRequest) {
  console.log("🐾 [ADD-PET-SESSION] Starting pet creation with session handling...");
  
  try {
    // 1. Parsear el body
    const body = await req.json();
    const { userId, petData, userEmail }: { 
      userId: string; 
      petData: PetPayload;
      userEmail?: string; // Pasado desde el cliente
    } = body;
    
    if (!userId || !petData) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }
    
    console.log("🔍 [ADD-PET-SESSION] Request for user:", userId, "email:", userEmail);
    
    // 2. Verificar que el usuario existe y es admin (sin depender de Kinde)
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserRole: {
          include: {
            Role: true
          }
        }
      }
    });
    
    if (!dbUser) {
      console.error("❌ [ADD-PET-SESSION] User not found in database:", userId);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    // Verificar que es admin
    const isAdmin = dbUser.UserRole?.some(ur => ur.Role.key === "admin");
    if (!isAdmin) {
      console.error("❌ [ADD-PET-SESSION] User is not admin:", userId);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }
    
    console.log("✅ [ADD-PET-SESSION] User verified as admin:", dbUser.email);
    
    // 3. Validar datos de la mascota
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
    
    // 4. Crear la mascota
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
    
    console.log("✅ [ADD-PET-SESSION] Pet created successfully:", result.id);
    
    // 5. Crear un token temporal para mantener la sesión
    const tempToken = createTempToken(userId);
    
    // 6. Configurar cookie temporal
    const cookieStore = cookies();
    const response = NextResponse.json({
      success: true,
      pet: result,
      redirectUrl: `/admin/clientes/${userId}`,
      tempToken // Enviar también al cliente
    });
    
    // Establecer una cookie temporal que dure 30 segundos
    response.cookies.set({
      name: 'vet-temp-auth',
      value: tempToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30, // 30 segundos
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error("❌ [ADD-PET-SESSION] Error creating pet:", error);
    
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
