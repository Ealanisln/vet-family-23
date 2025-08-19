import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prismaDB";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// ⚠️ EMERGENCY ENDPOINT - SOLO PARA DEBUGGING
export async function POST(_req: NextRequest) {
  console.log("🚨 [EMERGENCY-ADMIN] Emergency admin assignment requested...");
  
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    console.log("🔍 [EMERGENCY-ADMIN] User from Kinde:", { 
      id: user?.id, 
      email: user?.email 
    });

    if (!user?.id) {
      return NextResponse.json({
        success: false,
        error: "No user found in Kinde session",
        suggestion: "Try logging out and logging back in"
      });
    }

    // Find user in database
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

    if (!dbUser) {
      return NextResponse.json({
        success: false,
        error: "User not found in database",
        kindeUser: { id: user.id, email: user.email }
      });
    }

    // Check if already has admin role
    const hasAdminRole = dbUser.UserRole.some(ur => ur.Role.key === "admin");
    
    if (hasAdminRole) {
      return NextResponse.json({
        success: true,
        message: "User already has admin role",
        user: {
          id: dbUser.id,
          email: dbUser.email,
          roles: dbUser.UserRole.map(ur => ur.Role.key)
        }
      });
    }

    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { key: "admin" }
    });

    if (!adminRole) {
      return NextResponse.json({
        success: false,
        error: "Admin role not found in database"
      });
    }

    // Assign admin role
    await prisma.userRole.create({
      data: {
        id: crypto.randomUUID(),
        userId: dbUser.id,
        roleId: adminRole.id
      }
    });

    console.log("✅ [EMERGENCY-ADMIN] Admin role assigned successfully");

    return NextResponse.json({
      success: true,
      message: "Admin role assigned successfully",
      user: {
        id: dbUser.id,
        email: dbUser.email,
        kindeId: dbUser.kindeId
      }
    });

  } catch (error) {
    console.error("❌ [EMERGENCY-ADMIN] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
