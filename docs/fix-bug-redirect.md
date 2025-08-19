# 🚀 Plan Definitivo: Migración a API Route para Eliminar Bug de Sesión

## 🎯 Problema Confirmado
- **NO hay cookies de Kinde** después del Server Action
- La sesión se pierde completamente entre el Server Action y el cliente
- Esto causa el ciclo de redirección login/logout

## ✅ Solución: API Route en lugar de Server Action

### Paso 1: Crear Nueva API Route (5 minutos)

**Archivo nuevo**: `/src/app/api/pets/add/route.ts`

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
```

### Paso 2: Actualizar el Componente del Formulario (3 minutos)

**Archivo**: `/src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (petData: PetFormData) => {
    const userId = params.id as string;
    setIsSubmitting(true);

    try {
      // Preparar payload
      const petPayload = {
        ...petData,
        dateOfBirth: petData.dateOfBirth instanceof Date 
          ? petData.dateOfBirth.toISOString()
          : new Date(petData.dateOfBirth).toISOString(),
        weight: typeof petData.weight === 'string' 
          ? parseFloat(petData.weight) 
          : petData.weight,
      };

      // Llamar a la API Route en lugar del Server Action
      const response = await fetch('/api/pets/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          petData: petPayload
        }),
        // Importante: incluir credenciales para mantener la sesión
        credentials: 'include'
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [PET-FORM] Pet added successfully via API');
        
        // Usar la URL de redirección de la respuesta
        const redirectUrl = result.redirectUrl || `/admin/clientes/${userId}`;
        
        // Pequeño delay para asegurar que todo se procese
        setTimeout(() => {
          // Usar window.location para una navegación completa
          // Esto asegura que las cookies de Kinde se mantengan
          window.location.href = redirectUrl;
        }, 100);
        
      } else {
        console.error('❌ [PET-FORM] Error from API:', result.error);
        // TODO: Mostrar error al usuario con toast
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ [PET-FORM] Error calling API:", error);
      alert('Error al agregar mascota. Por favor intenta de nuevo.');
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

### Paso 3: Opcional - API Route para Editar (Si también tienes ese problema)

**Archivo nuevo**: `/src/app/api/pets/update/route.ts`

Similar al de agregar, pero con método PUT y lógica de actualización.

## 🎯 Ventajas de esta Solución

1. **Mantiene la sesión**: Las API Routes mantienen las cookies correctamente
2. **Sin race conditions**: No hay problemas entre Server Actions y cliente
3. **Mejor debugging**: Los logs de API son más claros
4. **Más control**: Puedes manejar errores y respuestas de forma más granular
5. **Sin CORS issues**: Todo está en el mismo dominio

## 🧪 Prueba Rápida

1. Crea los archivos nuevos
2. Actualiza el componente del formulario
3. Prueba agregando una mascota
4. Verifica que NO haya redirecciones a login

## 📊 Verificación Post-Fix

Después de implementar, verifica:

```javascript
// En la consola del navegador después de agregar mascota
fetch('/api/kinde-debug-full')
  .then(r => r.json())
  .then(data => {
    console.log('Cookies de Kinde:', data.cookies.kindeRelated);
    console.log('Usuario:', data.user.data);
    console.log('Autenticado:', data.authentication.status);
  });
```

Deberías ver:
- ✅ Cookies de Kinde presentes
- ✅ Usuario con datos
- ✅ Status autenticado = true

## 🚨 Si Necesitas Rollback

1. Simplemente vuelve a usar el Server Action original
2. Implementa el fix temporal del `setTimeout` + `window.location`

## 💡 Bonus: Mejorar UX

Considera agregar:
- Toast notifications con `react-hot-toast` o `sonner`
- Loading overlay mientras se procesa
- Confirmación visual de éxito

## 🔑 Resumen de Archivos a Modificar

1. **Crear**: `/src/app/api/pets/add/route.ts`
2. **Actualizar**: `/src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx`
3. **Opcional**: Crear `/src/app/api/pets/update/route.ts` si también editas mascotas

Esta solución elimina completamente el problema de pérdida de sesión porque:
- La API Route se ejecuta en el mismo contexto que el resto de la app
- Las cookies se mantienen durante toda la operación
- No hay cambio de contexto entre Server Action y cliente