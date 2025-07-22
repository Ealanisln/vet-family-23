import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prismaDB";
import UsersManagement from "./UsersManagement";

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  roles: Array<{
    id: string;
    key: string;
    name: string;
  }>;
}

async function getUsers(): Promise<User[]> {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();

  if (!user?.id) {
    redirect("/api/auth/login");
  }

  // Verificar permisos de admin con fallback robusto
  let isAdmin = false;
  
  try {
    const roles = await getRoles();
    isAdmin = roles?.some((role) => role.key === "admin") || false;
    
    // Si no tenemos roles de Kinde, verificar en la base de datos
    if (!isAdmin && (!roles || roles.length === 0)) {
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
    console.error("Error checking admin roles:", error);
    // En caso de error, verificar solo en la base de datos
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
      // Si todo falla, redirigir a cliente por seguridad
      redirect("/cliente");
    }
  }

  if (!isAdmin) {
    redirect("/cliente");
  }

  const users = await prisma.user.findMany({
    include: {
      UserRole: {
        include: {
          Role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.UserRole.map(ur => ({
      id: ur.Role.id,
      key: ur.Role.key,
      name: ur.Role.name
    }))
  }));
}

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersManagement initialUsers={users} />;
} 