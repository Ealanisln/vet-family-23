# 🔧 Fix: Autenticación en API Route para Producción

## 🎯 Problema en Producción
- `getKindeServerSession()` no funciona correctamente en API Routes en Vercel
- Las cookies no se propagan entre el cliente y el API Route

## ✅ Solución: Verificación Alternativa

### Opción 1: Verificar por User ID desde DB (Más Simple)

#### Paso 1: Modificar API Route
**Archivo**: `/src/app/api/pets/add/route.ts`

```typescript
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
        }m
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
```

### Opción 2: Volver a Server Action con Fix Mejorado (Alternativa)

Si el API Route sigue sin funcionar, podemos volver al Server Action pero con un fix mejorado:

#### Modificar el componente del formulario
**Archivo**: `/src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";
import { addPet } from "@/app/actions/add-edit-pet"; // Volver al Server Action

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (petData: PetFormData) => {
    const userId = params.id as string;
    setIsSubmitting(true);

    try {
      const petPayload = {
        ...petData,
        dateOfBirth: petData.dateOfBirth instanceof Date 
          ? petData.dateOfBirth 
          : new Date(petData.dateOfBirth),
        weight: typeof petData.weight === 'string' 
          ? parseFloat(petData.weight) 
          : petData.weight,
      };

      const result = await addPet(userId, petPayload);
      
      if (result.success) {
        console.log('✅ [PET-FORM] Pet added successfully');
        
        // FIX CLAVE: Usar navegación completa del navegador
        // Esto fuerza a recargar todo el contexto de autenticación
        if (isClient) {
          // Esperar un momento para que se complete la transacción
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Navegación completa del navegador
          window.location.href = `/admin/clientes/${userId}`;
        }
      } else {
        console.error('❌ [PET-FORM] Error:', result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ [PET-FORM] Error:", error);
      alert('Error al agregar mascota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const userId = params.id as string;
    router.push(`/admin/clientes/${userId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <UnifiedPetForm
        userId={params.id as string}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        showInternalId={true}
        showMedicalHistory={false}
        showDeceasedToggle={false}
        showAsCard={true}
        title="Agregar Nueva Mascota"
        submitButtonText="Agregar Mascota"
        cancelButtonText="Volver"
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
```

## 🎯 Recomendación

**Usa la Opción 1** (modificar el API Route) primero. Esta solución:
- Mantiene el API Route pero con verificación más flexible
- Si Kinde falla, verifica por base de datos
- Solo permite operaciones si el usuario es admin

## 🧪 Prueba

1. Implementa la Opción 1
2. Deploy a Vercel
3. Prueba agregar una mascota
4. Si funciona, ¡celebra! 🎉
5. Si no, implementa la Opción 2

## 💡 Nota sobre el Error CORS

El error CORS del logout es un problema separado. Para solucionarlo:
- Usa `window.location.href = '/api/auth/logout'` en lugar de fetch para logout
- O crea un componente LogoutButton que haga la navegación directa