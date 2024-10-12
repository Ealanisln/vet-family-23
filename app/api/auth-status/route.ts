// app/api/auth-status/route.ts

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
      
      authStatus = await isAuthenticated();

      if (user && user.id) {
        dbUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
        });

        if (!dbUser && user.email) {
          console.log("Checking if user exists with email");
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          
          if (!dbUser) {
            console.log("Creating new user in database");
            dbUser = await prisma.user.create({
              data: {
                kindeId: user.id,
                email: user.email,
                roles: [],
              },
            });
          } else {
            console.log("Updating existing user with new kindeId");
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { kindeId: user.id },
            });
          }
        }

        // Obtener roles del token de acceso
        const accessToken = await getAccessToken();

        if (accessToken && typeof accessToken === "object" && "roles" in accessToken) {
          userRoles = Array.isArray(accessToken.roles) ? accessToken.roles : [];
        }

        // Actualizar roles solo si han cambiado
        if (dbUser && JSON.stringify(dbUser.roles) !== JSON.stringify(userRoles)) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { roles: userRoles },
          });
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