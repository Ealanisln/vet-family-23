import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized - No user found", { status: 401 });
    }

    console.log('User details:', {
      id: user.id,
      email: user.email,
      givenName: user.given_name,
      familyName: user.family_name
    });

    // Primero, asegurarnos de que el usuario existe en la base de datos local
    let dbUser = await prisma.user.findUnique({
      where: { kindeId: user.id },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    // Si el usuario no existe en la base de datos local, lo creamos
    if (!dbUser) {
      // Verificar si es el primer usuario en el sistema
      const usersCount = await prisma.user.count();
      const isFirstUser = usersCount === 0;

      console.log('Creating local user for Kinde user:', user.id);
      dbUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          kindeId: user.id,
          email: user.email || `kinde_${user.id}@placeholder.email`,
          firstName: user.given_name,
          lastName: user.family_name,
          name: `${user.given_name || ''} ${user.family_name || ''}`.trim(),
          // Si es el primer usuario, le asignamos el rol de admin automáticamente
          ...(isFirstUser && {
            userRoles: {
              create: {
                roleId: "cd032a8a-4499-471e-a201-56c384afef7b" // ID del rol admin
              }
            }
          })
        },
        include: {
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
      
      if (isFirstUser) {
        console.log('First user in system - assigned admin role automatically');
      } else {
        console.log('New user created - admin role must be assigned manually');
      }
    }

    const isAdmin = dbUser.userRoles.some(ur => 
      ur.role.key === "admin" || ur.role.key === "ADMIN" || 
      ur.role.key === "superadmin" || ur.role.key === "SUPERADMIN"
    );

    if (!isAdmin) {
      console.log('Access denied. User roles:', dbUser.userRoles.map(ur => ({
        roleId: ur.roleId,
        roleKey: ur.role.key,
        roleName: ur.role.name
      })));
      return new NextResponse("Forbidden - User does not have admin privileges. Please contact your system administrator.", { status: 403 });
    }

    const body = await req.json();
    const { price, cost } = body;

    // Validar los datos
    if (typeof price !== "number" || typeof cost !== "number") {
      return new NextResponse("Invalid price or cost", { status: 400 });
    }

    if (price < 0 || cost < 0) {
      return new NextResponse("Price and cost must be positive", { status: 400 });
    }

    // Actualizar el producto
    const updatedProduct = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        price,
        cost,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("[INVENTORY_PRICE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 