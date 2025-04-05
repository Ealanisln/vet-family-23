import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const userId = "kp_1a482619303c4830a0d4bc31c5930b14";
    const adminRoleId = "cd032a8a-4499-471e-a201-56c384afef7b";

    const userRole = await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: adminRoleId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin role assigned successfully",
      userRole 
    });
  } catch (error) {
    console.error("[ASSIGN_ADMIN_ROLE]", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to assign admin role" 
    }, { status: 500 });
  }
} 