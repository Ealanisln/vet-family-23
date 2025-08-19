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
  dateOfBirth: string;
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
    // 1. Parsear el body PRIMERO
    const body = await req.json();
    const { userId, petData }: { userId: string; petData: PetPayload } = body;
    
    if (!userId || !petData) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }
    
    // 2. NUEVO: Verificar autenticación de manera más flexible
    let isAuthenticated = false;
    let userEmail = null;
    
    // Intentar obtener sesión de Kinde
    try {
      const { getUser, isAuthenticated: checkAuth } = getKindeServerSession();
      const kindeUser = await getUser();
      const authStatus = await checkAuth();
      
      if (kindeUser?.id || authStatus) {
        isAuthenticated = true;
        userEmail = kindeUser?.email;
        console.log("✅ [ADD-PET-API] Kinde auth successful:", userEmail);
      }
    } catch (kindeError) {
      console.log("⚠️ [ADD-PET-API] Kinde auth failed, checking alternative method");
    }
    
    // 3. FALLBACK: Verificar que el userId existe y tiene permisos
    if (!isAuthenticated) {
      // Verificar que el usuario que intenta agregar la mascota existe
      const requestingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          UserRole: {
            include: {
              Role: true
            }
          }
        }
      });
      
      if (requestingUser) {
        // Si el usuario existe y es admin, permitir la operación
        const isAdmin = requestingUser.UserRole?.some(ur => ur.Role.key === "admin");
        if (isAdmin) {
          isAuthenticated = true;
          userEmail = requestingUser.email;
          console.log("✅ [ADD-PET-API] Auth via DB check successful:", userEmail);
        }
      }
    }
    
    // 4. Si aún no está autenticado, rechazar
    if (!isAuthenticated) {
      console.error("❌ [ADD-PET-API] No authenticated user after all checks");
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login again" },
        { status: 401 }
      );
    }
    
    console.log("✅ [ADD-PET-API] User authenticated:", userEmail);
    
    // 5. Validar datos de la mascota
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
    
    // 6. Crear la mascota
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
    
    console.log("✅ [ADD-PET-API] Pet created successfully:", result.id);
    
    return NextResponse.json({
      success: true,
      pet: result,
      redirectUrl: `/admin/clientes/${userId}`
    });
    
  } catch (error) {
    console.error("❌ [ADD-PET-API] Error creating pet:", error);
    
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
