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
