import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";import { prisma } from "@/lib/prismaDB";

// Verificar si el usuario es admin
async function isUserAdmin(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { kindeId: userId },
    include: {
      UserRole: {
        include: {
          Role: true
        }
      }
    }
  });

  return dbUser?.UserRole.some(ur => 
    ur.Role.key === "admin" || 
    ur.Role.key === "ADMIN" || 
    ur.Role.key === "superadmin" || 
    ur.Role.key === "SUPERADMIN"
  ) ?? false;
}

// GET - Listar usuarios
export async function GET() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!await isUserAdmin(user.id)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
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

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        kindeId: user.kindeId,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.UserRole.map(ur => ({
          id: ur.Role.id,
          key: ur.Role.key,
          name: ur.Role.name
        }))
      }))
    });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST - Asignar rol a usuario
export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const currentUser = await getUser();

    if (!currentUser?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!await isUserAdmin(currentUser.id)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { userId, roleKey } = await req.json();

    if (!userId || !roleKey) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Verificar que el rol existe
    const role = await prisma.role.findFirst({
      where: {
        key: roleKey
      }
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Asignar el rol
    const userRole = await prisma.userRole.create({
      data: {
        id: crypto.randomUUID(),
        userId: userId,
        roleId: role.id
      },
      include: {
        Role: true
      }
    });

    return NextResponse.json({
      message: "Rol asignado correctamente",
      userRole: {
        userId: userRole.userId,
        roleId: userRole.roleId,
        roleName: userRole.Role.name
      }
    });
  } catch (error) {
    console.error("[USERS_POST]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
} 