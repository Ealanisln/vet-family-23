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
  const roles = await getRoles();

  if (!user?.id) {
    redirect("/api/auth/login");
  }

  // Verificar permisos de admin usando roles de Kinde
  const isAdmin = roles?.some((role) => role.key === "admin");
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