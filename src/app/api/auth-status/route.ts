import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/prismaDB";
import crypto from 'crypto';

export const dynamic = "force-dynamic";

// const prisma = new PrismaClient(); // Replaced with import from lib

// Define a type for Kinde roles based on usage
interface KindeRole {
  key: string;
  name: string;
  // Add other properties if needed based on Kinde's actual structure
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const { getUser, isAuthenticated, getAccessToken } = getKindeServerSession();

    let user = null;
    let authStatus = false;
    let dbUser = null;
    let userRoles: KindeRole[] = [];

    try {
      user = await getUser();
      authStatus = (await isAuthenticated()) ?? false;

      if (user && user.id) {
        dbUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
          include: { userRoles: { include: { role: true } } },
        });

        if (!dbUser && user.email) {
          console.log("Checking if user exists with email");
          dbUser = await prisma.user.findFirst({
            where: { email: user.email },
            include: { userRoles: { include: { role: true } } },
          });

          if (!dbUser) {
            console.log("Creating new user in database");
            dbUser = await prisma.user.create({
              data: {
                id: crypto.randomUUID(),  // Generate UUID for new user
                kindeId: user.id,
                email: user.email,
              },
              include: { userRoles: { include: { role: true } } },
            });
          } else {
            console.log("Updating existing user with new kindeId");
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { kindeId: user.id },
              include: { userRoles: { include: { role: true } } },
            });
          }
        }

        // Get roles from access token
        const accessToken = await getAccessToken();

        if (accessToken && typeof accessToken === "object" && "roles" in accessToken) {
          // Ensure accessToken.roles is an array before assigning
          userRoles = Array.isArray(accessToken.roles) ? accessToken.roles as KindeRole[] : [];
        }

        // Update roles only if they've changed
        if (dbUser) {
          const currentRoles = dbUser.userRoles.map((ur) => ur.role.key);
          const newRoles = userRoles.filter(
            (role) => !currentRoles.includes(role.key)
          );
          const rolesToRemove = currentRoles.filter(
            (role) => !userRoles.some((r) => r.key === role)
          );

          if (newRoles.length > 0 || rolesToRemove.length > 0) {
            for (const role of newRoles) {
              await prisma.role.upsert({
                where: { key: role.key },
                update: {},
                create: { key: role.key, name: role.name },
              });

              await prisma.userRole.create({
                data: {
                  user: { connect: { id: dbUser.id } },
                  role: { connect: { key: role.key } },
                },
              });
            }

            for (const roleKey of rolesToRemove) {
              const roleToRemove = dbUser.userRoles.find(
                (ur) => ur.role.key === roleKey
              );
              if (roleToRemove) {
                await prisma.userRole.delete({
                  where: { id: roleToRemove.id },
                });
              }
            }

            // Fetch updated user data
            dbUser = await prisma.user.findUnique({
              where: { id: dbUser.id },
              include: { userRoles: { include: { role: true } } },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in auth process:", error);
    }

    const response = {
      user: { ...user, roles: dbUser?.userRoles.map((ur) => ur.role) || [] },
      isAuthenticated: authStatus,
      dbUser,
      roles: dbUser?.userRoles.map((ur) => ur.role) || [],
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