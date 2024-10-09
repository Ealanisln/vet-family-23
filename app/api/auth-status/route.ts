import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface KindePermission {
  id: string;
  key: string;
}

interface KindePermissions {
  permissions: KindePermission[];
}

export async function GET(req: NextRequest) {
  try {
    const { getUser, isAuthenticated, getPermissions } = getKindeServerSession();
    
    let user = null;
    let authStatus = false;
    let dbUser = null;
    let userPermissions: string[] = [];

    try {
      user = await getUser();
      console.log("User from Kinde:", user);
      
      authStatus = await isAuthenticated();
      console.log("Auth status:", authStatus);

      if (user && user.id) {
        dbUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
        });
        console.log("User from database:", dbUser);

        // Get permissions
        const permissions = await getPermissions() as KindePermissions | null;
        console.log("Permissions from Kinde:", permissions);

        if (permissions && Array.isArray(permissions.permissions)) {
          userPermissions = permissions.permissions.map((permission: KindePermission) => permission.key);
        } else {
          console.log("No permissions found or permissions is not an array");
        }

        if (!dbUser) {
          console.log("Creating new user in database");
          dbUser = await prisma.user.create({
            data: {
              kindeId: user.id,
              email: user.email || "",
              firstName: user.given_name || null,
              lastName: user.family_name || null,
              name: user.given_name && user.family_name ? `${user.given_name} ${user.family_name}` : null,
              roles: userPermissions,
            },
          });
          console.log("New user created:", dbUser);
        } else {
          // Update user information and roles
          const updatedUser = await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              email: user.email || undefined,
              firstName: user.given_name || undefined,
              lastName: user.family_name || undefined,
              name: user.given_name && user.family_name ? `${user.given_name} ${user.family_name}` : undefined,
              roles: userPermissions,
            },
          });
          console.log("User updated:", updatedUser);
          dbUser = updatedUser;
        }
      }
    } catch (error) {
      console.error("Error in auth process:", error);
    }

    const response = {
      user: { ...user, permissions: userPermissions },
      isAuthenticated: authStatus,
      dbUser,
      permissions: userPermissions,
    };
    console.log("API response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in auth-status API route:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}