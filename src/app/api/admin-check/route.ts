import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prismaDB";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({
        isAdmin: false,
        isAuthenticated: false,
        error: "No user found"
      });
    }

    let isAdmin = false;
    
    try {
      // Primer intento: verificar roles de Kinde
      const kindeRoles = await getRoles();
      isAdmin = kindeRoles?.some((role) => role.key === "admin") || false;
      
      console.log("Kinde roles:", kindeRoles);
      console.log("Kinde admin check:", isAdmin);
      
      // Si no es admin según Kinde, verificar en la base de datos
      if (!isAdmin) {
        const dbUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
          select: {
            UserRole: {
              select: {
                Role: {
                  select: {
                    key: true
                  }
                }
              }
            }
          }
        });
        
        isAdmin = dbUser?.UserRole?.some((ur) => ur.Role.key === "admin") || false;
        console.log("Database admin check:", isAdmin);
        console.log("Database roles:", dbUser?.UserRole?.map(ur => ur.Role.key));
      }
      
    } catch (error) {
      console.error("Error checking admin status:", error);
      // En caso de error, ser conservador y devolver false
      isAdmin = false;
    }

    return NextResponse.json({
      isAdmin,
      isAuthenticated: true,
      userId: user.id,
      userEmail: user.email
    });

  } catch (error) {
    console.error("Error in admin-check API route:", error);
    return NextResponse.json({
      isAdmin: false,
      isAuthenticated: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}
