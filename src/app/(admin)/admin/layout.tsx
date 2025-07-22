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
  const user = await getUser();

  // Verificar permisos de admin con fallback robusto
  let isAdmin = false;
  
  try {
    const roles = await getRoles();
    isAdmin = roles?.some((role) => role.key === "admin") || false;
    
    // Si no tenemos roles de Kinde, verificar en la base de datos
    if (!isAdmin && (!roles || roles.length === 0) && user?.id) {
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
  } catch (error) {
    console.warn("Error getting roles, checking database:", error);
    // En caso de error con Kinde, verificar en la base de datos
    if (user?.id) {
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
      } catch (dbError) {
        console.error("Error checking admin roles in database:", dbError);
      }
    }
  }

  if (!isAdmin) {
    redirect("/cliente");
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
