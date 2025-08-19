# 🔧 Plan Maestro: Fix Bug de Redirección al Agregar Mascota

## 🎯 Resumen del Problema

**Síntoma**: Cuando un usuario admin intenta agregar una mascota desde `/admin/clientes/[id]/mascota/agregar`, ocurre un ciclo de redirección:
1. POST exitoso → No encuentra usuario → Redirige a `/cliente`
2. `/cliente` llama a `getClientData()` → Redirige a `/api/auth/login`
3. Después del callback de Kinde → Redirige a `/admin`
4. Error de CORS con el logout

## 🔍 Análisis de la Causa Raíz

### Problema Principal: **Race Condition en Server Actions**
- El formulario de agregar mascota usa `"use client"` y llama a una Server Action (`addPet`)
- Después del POST exitoso, hace un fetch a `/api/admin-check` desde el cliente
- **El problema clave**: La sesión de Kinde no se propaga correctamente entre el contexto del Server Action y el API route

### Problemas Secundarios:
1. **CORS Error**: El logout intenta hacer un RSC fetch con headers personalizados
2. **Middleware Inconsistente**: No maneja correctamente las Server Actions
3. **Layout Permisivo**: El admin layout está siendo demasiado permisivo para evitar loops

## ✅ Solución Propuesta

### Fase 1: Fix Inmediato (5 minutos)

#### 1.1 Actualizar el componente de agregar mascota
```typescript
// src/app/(admin)/admin/clientes/[id]/mascota/agregar/page.tsx

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UnifiedPetForm, { PetFormData } from "@/components/ui/UnifiedPetForm";
import { addPet } from "@/app/actions/add-edit-pet";

export default function AddPetView() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        // FIX: Simplificar la redirección - siempre ir al cliente
        // El usuario ya está en contexto admin, no necesitamos verificar
        console.log('✅ [PET-FORM] Pet added successfully, redirecting to client details');
        
        // Usar replace en lugar de push para evitar problemas de historial
        router.replace(`/admin/clientes/${userId}`);
        
        // Alternativa si necesitas verificar el rol:
        // setTimeout(() => {
        //   router.replace(`/admin/clientes/${userId}`);
        // }, 100);
      } else {
        console.error('❌ [PET-FORM] Error adding pet:', result.error);
        // TODO: Mostrar error al usuario con toast
      }
    } catch (error) {
      console.error("❌ [PET-FORM] Error al agregar mascota:", error);
      // TODO: Mostrar error al usuario con toast
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

### Fase 2: Mejorar el Middleware (10 minutos)

#### 2.1 Actualizar middleware.ts
```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const PUBLIC_PATHS = ['/', '/blog', '/promociones'];
const AUTH_PATHS = ['/api/auth'];
const STATIC_PATHS = ['/_next', '/assets', '/favicon.ico', '/images'];

const matchesPath = (pathname: string, patterns: string[]) => {
  return patterns.some(path => pathname === path || pathname.startsWith(path));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass para rutas estáticas y de autenticación
  if (
    matchesPath(pathname, [...STATIC_PATHS, ...AUTH_PATHS]) ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Bypass para rutas públicas
  if (matchesPath(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // FIX: Mejorar manejo de rutas admin
  if (pathname.startsWith('/admin')) {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession();
      
      // Obtener el estado de autenticación de manera más robusta
      const [authenticated, user] = await Promise.all([
        isAuthenticated().catch(() => false),
        getUser().catch(() => null)
      ]);

      // Solo redirigir si definitivamente no hay usuario
      if (!user && !authenticated) {
        // FIX: Evitar loops de redirección
        const referer = request.headers.get('referer');
        if (referer?.includes('/api/auth/')) {
          // Si viene de un proceso de auth, permitir el acceso
          return NextResponse.next();
        }

        const returnTo = encodeURIComponent(request.url);
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('post_login_redirect_url', returnTo);
        
        return NextResponse.redirect(loginUrl);
      }

      // Configurar headers anti-cache para rutas admin
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      response.headers.set('x-middleware-cache', 'no-cache');
      return response;
      
    } catch (error) {
      console.error('❌ [MIDDLEWARE] Error checking auth:', error);
      // En caso de error, permitir el acceso para evitar bloqueos
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/pos/:path*',
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
};
```

### Fase 3: Mejorar Server Action (5 minutos)

#### 3.1 Actualizar add-edit-pet.ts
```typescript
// src/app/actions/add-edit-pet.ts
// Agregar al final de la función addPet, después del revalidatePath

export async function addPet(
  userId: string,
  petData: PetDataForSubmit
): Promise<ActionResult<PetWithMedicalHistory>> {
  // ... código existente ...

  try {
    // ... código existente de creación de mascota ...

    // FIX: Asegurar que los revalidatePath funcionen correctamente
    const paths = [
      `/admin/clientes/${userId}`,
      `/admin/clientes/${userId}/mascotas`,
      `/admin/mascotas`,
      `/api/clients/${userId}/pets`
    ];
    
    // Revalidar todos los paths de manera secuencial
    for (const path of paths) {
      try {
        revalidatePath(path);
      } catch (e) {
        console.warn(`Failed to revalidate path: ${path}`, e);
      }
    }
    
    return { success: true, pet: result as PetWithMedicalHistory };
  } catch (error: unknown) {
    return handlePrismaError(error, "addPet");
  }
}
```

### Fase 4: Fix del Layout Admin (5 minutos)

#### 4.1 Restaurar el layout admin a una versión más estricta
```typescript
// src/app/(admin)/admin/layout.tsx

import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prismaDB";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser, getRoles } = getKindeServerSession();
  
  // FIX: Usar try-catch para manejar errores de sesión
  let user = null;
  let roles = null;
  
  try {
    user = await getUser();
    roles = await getRoles();
  } catch (error) {
    console.error("❌ [ADMIN-LAYOUT] Error getting Kinde session:", error);
    redirect("/api/auth/login");
  }

  // Verificar que hay usuario
  if (!user?.id) {
    console.log("❌ [ADMIN-LAYOUT] No user found, redirecting to login");
    redirect("/api/auth/login");
  }

  // Verificar roles
  let isAdmin = roles?.some((role) => role.key === "admin") || false;
  
  // Si no es admin según Kinde, verificar en DB
  if (!isAdmin) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
        include: {
          UserRole: {
            include: {
              Role: true
            }
          }
        }
      });
      
      isAdmin = dbUser?.UserRole?.some((ur) => ur.Role.key === "admin") || false;
    } catch (error) {
      console.error("❌ [ADMIN-LAYOUT] Error checking DB roles:", error);
    }
  }

  // Si no es admin, redirigir a cliente
  if (!isAdmin) {
    console.log("⚠️ [ADMIN-LAYOUT] User is not admin, redirecting to /cliente");
    redirect("/cliente");
  }

  const userData = {
    name: user?.given_name && user?.family_name 
      ? `${user.given_name} ${user.family_name}`
      : user?.given_name || user?.email || "Admin",
    email: user?.email || "admin@example.com",
    avatar: user?.picture || "/avatars/admin.jpg",
  };

  return <AdminLayoutClient userData={userData}>{children}</AdminLayoutClient>;
}
```

### Fase 5: Fix CORS para Logout (2 minutos)

#### 5.1 Crear un componente de logout sin RSC
```typescript
// src/components/admin/LogoutButton.tsx

"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = () => {
    // FIX: Usar window.location para evitar problemas de RSC/CORS
    window.location.href = "/api/auth/logout";
  };
  
  return (
    <button 
      onClick={handleLogout}
      className="your-button-classes"
    >
      Cerrar Sesión
    </button>
  );
}
```

## 🚀 Pasos de Implementación

1. **Backup actual**: Guarda una copia de los archivos actuales
2. **Implementa Fase 1**: El fix inmediato del formulario de agregar mascota
3. **Prueba**: Verifica que la redirección funcione
4. **Implementa Fases 2-5**: Si el problema persiste
5. **Deploy**: Sube los cambios a producción

## 🧪 Testing

### Test Manual
1. Login como admin
2. Ir a `/admin/clientes/[id]`
3. Click en "Agregar Mascota"
4. Llenar el formulario y enviar
5. **Esperado**: Redirigir a `/admin/clientes/[id]` sin ciclos

### Comando de Debug
```bash
# En la consola del navegador, ejecuta:
fetch('/api/kinde-debug-full')
  .then(r => r.json())
  .then(console.log)
```

## 📊 Monitoreo Post-Fix

### Logs a Revisar
- Sin mensajes "No user found, redirecting to cliente" después del POST
- Sin errores CORS en la consola
- Sin múltiples redirecciones en los logs de Vercel

### Métricas de Éxito
- ✅ Agregar mascota funciona sin redirecciones extra
- ✅ El usuario permanece en el contexto admin
- ✅ No hay errores de CORS
- ✅ La sesión se mantiene estable

## 🔄 Plan de Rollback

Si algo sale mal:
1. Restaura los archivos desde el backup
2. Usa el endpoint de emergencia: `/api/emergency-admin`
3. Contacta soporte si persisten los problemas

## 💡 Mejoras Futuras

1. **Implementar Toast Notifications**: Para feedback visual
2. **Agregar Loading States**: Durante las operaciones async
3. **Mejorar Error Handling**: Mensajes más descriptivos
4. **Cache de Sesión**: Reducir llamadas a Kinde
5. **Logging Mejorado**: Más telemetría para debugging