import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prismaDB";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  console.log("🔍 [ADMIN-CHECK] Starting admin verification...");
  
  try {
    const { getUser, getRoles } = getKindeServerSession();
    const user = await getUser();

    console.log("🔍 [ADMIN-CHECK] User from Kinde:", { 
      id: user?.id, 
      email: user?.email, 
      given_name: user?.given_name 
    });

    if (!user?.id) {
      console.log("❌ [ADMIN-CHECK] No user found");
      return NextResponse.json({
        isAdmin: false,
        isAuthenticated: false,
        error: "No user found",
        debug: "No user ID from Kinde"
      });
    }

    let isAdmin = false;
    let debugInfo: {
      kindeRoles: any[];
      kindeAdminCheck: boolean;
      dbUser: any;
      dbAdminCheck: boolean;
      dbRoles: any[];
      error?: string;
    } = {
      kindeRoles: [],
      kindeAdminCheck: false,
      dbUser: null,
      dbAdminCheck: false,
      dbRoles: []
    };
    
    try {
      // Primer intento: verificar roles de Kinde
      const kindeRoles = await getRoles();
      isAdmin = kindeRoles?.some((role) => role.key === "admin") || false;
      
      debugInfo.kindeRoles = kindeRoles || [];
      debugInfo.kindeAdminCheck = isAdmin;
      
      console.log("🔍 [ADMIN-CHECK] Kinde roles:", kindeRoles);
      console.log("🔍 [ADMIN-CHECK] Kinde admin check:", isAdmin);
      
      // Si no es admin según Kinde, verificar en la base de datos
      if (!isAdmin) {
        console.log("🔍 [ADMIN-CHECK] Checking database for admin roles...");
        const dbUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
          select: {
            id: true,
            email: true,
            UserRole: {
              select: {
                Role: {
                  select: {
                    key: true,
                    name: true
                  }
                }
              }
            }
          }
        });
        
        debugInfo.dbUser = dbUser;
        debugInfo.dbRoles = dbUser?.UserRole?.map(ur => ur.Role.key) || [];
        
        isAdmin = dbUser?.UserRole?.some((ur) => ur.Role.key === "admin") || false;
        debugInfo.dbAdminCheck = isAdmin;
        
        console.log("🔍 [ADMIN-CHECK] Database user:", dbUser);
        console.log("🔍 [ADMIN-CHECK] Database admin check:", isAdmin);
        console.log("🔍 [ADMIN-CHECK] Database roles:", dbUser?.UserRole?.map(ur => ur.Role.key));
      }
      
    } catch (error) {
      console.error("❌ [ADMIN-CHECK] Error checking admin status:", error);
      // En caso de error, ser conservador y devolver false
      isAdmin = false;
      debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
    }

    const response = {
      isAdmin,
      isAuthenticated: true,
      userId: user.id,
      userEmail: user.email,
      debug: debugInfo
    };

    console.log("✅ [ADMIN-CHECK] Final response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ [ADMIN-CHECK] Error in admin-check API route:", error);
    return NextResponse.json({
      isAdmin: false,
      isAuthenticated: false,
      error: "Internal server error",
      debug: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
