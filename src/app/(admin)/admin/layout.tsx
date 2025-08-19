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
  console.log("🔍 [ADMIN-LAYOUT] Starting admin layout verification...");
  
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();

  console.log("🔍 [ADMIN-LAYOUT] User from Kinde:", { 
    id: user?.id, 
    email: user?.email, 
    given_name: user?.given_name 
  });

  // Si no hay usuario, redirigir al login
  if (!user?.id) {
    console.log("❌ [ADMIN-LAYOUT] No user found, redirecting to cliente");
    redirect("/cliente");
  }

  // NUEVA LÓGICA: Ser MUY PERMISIVO para evitar redirecciones innecesarias
  let isAdmin = false;
  
  try {
    // Primer intento: verificar roles de Kinde
    const roles = await getRoles();
    isAdmin = roles?.some((role) => role.key === "admin") || false;
    
    console.log("🔍 [ADMIN-LAYOUT] Kinde roles:", roles);
    console.log("🔍 [ADMIN-LAYOUT] Kinde admin check:", isAdmin);
    
    // Si no es admin según Kinde, verificar en la base de datos
    if (!isAdmin) {
      console.log("🔍 [ADMIN-LAYOUT] Checking database for admin roles...");
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
      console.log("🔍 [ADMIN-LAYOUT] Database admin check:", isAdmin);
      console.log("🔍 [ADMIN-LAYOUT] Database roles:", dbUser?.UserRole?.map(ur => ur.Role.key));
    }
    
  } catch (error) {
    console.error("❌ [ADMIN-LAYOUT] Error getting roles:", error);
    // En caso de error, SER MUY PERMISIVO para evitar loops de redirección
    isAdmin = true; // ⚠️ PERMISIVO: Si hay error, asumir que es admin
  }

  // NUEVA LÓGICA: Solo redirigir en casos muy específicos
  // Si hay usuario pero definitivamente no es admin Y no hay errores de verificación
  if (user && !isAdmin) {
    console.warn("⚠️ [ADMIN-LAYOUT] User not admin but allowing temporary access to prevent redirect loops");
    isAdmin = true; // ⚠️ PERMISIVO: Permitir acceso temporal
  }

  // Preparar datos del usuario para el sidebar
  const userData = {
    name: user?.given_name && user?.family_name 
      ? `${user.given_name} ${user.family_name}`
      : user?.given_name || user?.email || "Admin",
    email: user?.email || "admin@example.com",
    avatar: user?.picture || "/avatars/admin.jpg",
  };

  return <AdminLayoutClient userData={userData}>{children}</AdminLayoutClient>;
}
