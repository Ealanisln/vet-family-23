import { prisma, safePrismaOperation } from "@/lib/prismaDB";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

export async function POST() {
  try {
    const userId = "kp_1a482619303c4830a0d4bc31c5930b14";
    const adminRoleId = "cd032a8a-4499-471e-a201-56c384afef7b";

    const userRole = await safePrismaOperation(
      () => prisma.userRole.create({
        data: {
          id: randomUUID(),
          userId: userId,
          roleId: adminRoleId,
        } satisfies Prisma.UserRoleUncheckedCreateInput,
      }),
      null // fallback value for build time
    );

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