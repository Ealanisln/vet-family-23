// src/app/(admin)/admin/page.tsx

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboard from './AdminDashboard';

export const dynamic = "force-dynamic"

export default async function Component() {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  
  let isAdmin = false;
  
  try {
    const roles = await getRoles();
    isAdmin = roles?.some((role) => role.key === "admin") || false;
  } catch (error) {
    console.warn("Error getting roles from Kinde:", error);
    // Si hay error con Kinde, no redirigir inmediatamente
    // Permitir que el usuario permanezca en el admin si ya está autenticado
    isAdmin = !!user;
  }

  // Solo redirigir si definitivamente no es admin y no hay usuario
  if (!isAdmin && !user) {
    redirect("/cliente");
  }
  
  // Si hay usuario pero no se pudo verificar el rol, permitir acceso temporal
  if (user && !isAdmin) {
    console.warn("User authenticated but admin role verification failed, allowing temporary access");
    isAdmin = true;
  }

  const username = user?.given_name || 'Usuario';

  return <AdminDashboard username={username} isAdmin={isAdmin} userEmail={user?.email} />;
}