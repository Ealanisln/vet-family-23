import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";import { prisma } from "@/lib/prismaDB";



// GET - Listar usuarios
export async function GET() {
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();
    const roles = await getRoles();

    console.log("[USERS_GET] Debug - User:", { id: user?.id, email: user?.email });
    console.log("[USERS_GET] Debug - Roles:", roles?.map(r => r.key));

    if (!user?.id) {
      console.log("[USERS_GET] No user ID found");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos de admin usando roles de Kinde (igual que en el layout)
    const isAdmin = roles?.some((role) => role.key === "admin");
    console.log("[USERS_GET] Debug - isAdmin:", isAdmin);
    
    if (!isAdmin) {
      console.log("[USERS_GET] Access denied - not admin");
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
    const { getUser, getRoles } = getKindeServerSession();
    const currentUser = await getUser();
    const roles = await getRoles();

    if (!currentUser?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar permisos de admin usando roles de Kinde (igual que en el layout)
    const isAdmin = roles?.some((role) => role.key === "admin");
    if (!isAdmin) {
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