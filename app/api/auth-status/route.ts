import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { getUser, isAuthenticated, getAccessToken } = getKindeServerSession();
    
    let user = null;
    let authStatus = false;
    let dbUser = null;
    let userRoles: any[] = [];

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

        if (!dbUser) {
          console.log("Creating new user in database");
          dbUser = await prisma.user.create({
            data: {
              kindeId: user.id,
              email: user.email || "",
              roles: [],
            },
          });
          console.log("New user created:", dbUser);
        }

        // Obtener roles del token de acceso
        const accessToken = await getAccessToken();
        console.log("Access token:", accessToken);

        if (accessToken && typeof accessToken === "object" && "roles" in accessToken) {
          userRoles = Array.isArray(accessToken.roles) ? accessToken.roles : [];
          console.log("Roles from access token:", userRoles);
        } else {
          console.log("No roles found in access token");
        }

        // Actualizar roles solo si han cambiado
        if (JSON.stringify(dbUser.roles) !== JSON.stringify(userRoles)) {
          console.log("Updating user roles in database");
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { roles: userRoles },
          });
          console.log("User roles updated");
        } else {
          console.log("User roles unchanged");
        }
      }
    } catch (error) {
      console.error("Error in auth process:", error);
    }

    const response = {
      user: { ...user, roles: userRoles },
      isAuthenticated: authStatus,
      dbUser,
      roles: userRoles,
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