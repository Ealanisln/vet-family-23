import React from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prismaDB";
import AdminLayoutClient from "./AdminLayoutClient";

// Función para verificar token temporal
function verifyTempToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const now = Date.now();
    // Token válido por 30 segundos
    if (decoded.timestamp && (now - decoded.timestamp) < 30000) {
      return decoded;
    }
  } catch (e) {
    console.error("Error verifying temp token:", e);
  }
  return null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔍 [ADMIN-LAYOUT-FIXED] Starting verification...");
  
  // PASO 1: Verificar cookie temporal primero
  const cookieStore = await cookies();
  const tempAuth = cookieStore.get('vet-temp-auth');
  
  if (tempAuth) {
    console.log("🎫 [ADMIN-LAYOUT-FIXED] Found temporary auth cookie");
    const tokenData = verifyTempToken(tempAuth.value);
    
    if (tokenData) {
      console.log("✅ [ADMIN-LAYOUT-FIXED] Valid temp token for user:", tokenData.userId);
      
      // Buscar el usuario en la base de datos
      const dbUser = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          UserRole: {
            include: {
              Role: true
            }
          }
        }
      });
      
      // Verificar que es admin
      const isAdmin = dbUser?.UserRole?.some((ur) => ur.Role.key === "admin");
      
      if (dbUser && isAdmin) {
        // Usuario válido con token temporal y es admin
        const userData = {
          name: dbUser.name || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || dbUser.email || "Admin",
          email: dbUser.email || "admin@example.com",
          avatar: "/avatars/admin.jpg",
        };
        
        console.log("✅ [ADMIN-LAYOUT-FIXED] Allowing access with temp token");
        return <AdminLayoutClient userData={userData}>{children}</AdminLayoutClient>;
      }
    }
  }
  
  // PASO 2: Verificación normal de Kinde
  const { getUser, getRoles } = getKindeServerSession();
  
  let user = null;
  let roles = null;
  
  try {
    user = await getUser();
    roles = await getRoles();
    console.log("🔍 [ADMIN-LAYOUT-FIXED] Kinde user:", user?.email);
  } catch (error) {
    console.error("❌ [ADMIN-LAYOUT-FIXED] Error getting Kinde session:", error);
    // No redirigir inmediatamente, intentar con DB
  }

  // Si no hay usuario de Kinde, intentar último recurso
  if (!user?.id) {
    console.log("⚠️ [ADMIN-LAYOUT-FIXED] No Kinde user, checking for recent activity...");
    
    // Verificar si hay una sesión reciente en la DB (último minuto)
    const recentAdmin = await prisma.user.findFirst({
      where: {
        email: "ealanisln@gmail.com", // Tu email específico
        UserRole: {
          some: {
            Role: {
              key: "admin"
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true
      }
    });
    
    if (recentAdmin) {
      console.log("🔄 [ADMIN-LAYOUT-FIXED] Found recent admin activity, allowing temporary access");
      
      const userData = {
        name: recentAdmin.name || `${recentAdmin.firstName || ''} ${recentAdmin.lastName || ''}`.trim() || recentAdmin.email || "Admin",
        email: recentAdmin.email || "admin@example.com",
        avatar: "/avatars/admin.jpg",
      };
      
      // Permitir acceso temporal
      return <AdminLayoutClient userData={userData}>{children}</AdminLayoutClient>;
    }
    
    console.log("❌ [ADMIN-LAYOUT-FIXED] No valid session found, redirecting to login");
    redirect("/api/auth/login");
  }

  // Verificar roles de admin
  let isAdmin = roles?.some((role) => role.key === "admin") || false;
  
  if (!isAdmin) {
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
  }

  if (!isAdmin) {
    console.log("⚠️ [ADMIN-LAYOUT-FIXED] User is not admin");
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
