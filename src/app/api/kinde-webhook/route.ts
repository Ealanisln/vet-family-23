import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const client = jwksClient({
  jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

interface KindeRole {
  id: string;
  key: string;
  name: string;
}

interface KindeUser {
  id: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  roles?: KindeRole[];
  phone_number?: string;
}

interface KindeEvent extends JwtPayload {
  type: string;
  data: {
    user: KindeUser;
  };
}

async function createOrUpdateUser(user: any, maxRetries = 5) {
  console.log(
    "Starting createOrUpdateUser with user data:",
    JSON.stringify(user, null, 2)
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        // First, ensure roles exist
        const rolePromises = (user.roles || ["user"]).map(
          async (role: string) => {
            return prisma.role.upsert({
              where: { key: role },
              create: { key: role, name: role },
              update: { name: role },
            });
          }
        );

        const roles = await Promise.all(rolePromises);
        console.log(
          `Roles ensured:`,
          roles.map((r) => r.key)
        );

        // Then create or update the user
        const dbUser = await prisma.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name:
              `${user.given_name || ""} ${user.family_name || ""}`.trim() ||
              null,
            userRoles: {
              deleteMany: {}, // Remove existing roles
              create: roles.map((role) => ({
                roleId: role.id,
              })),
            },
          },
          create: {
            kindeId: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name:
              `${user.given_name || ""} ${user.family_name || ""}`.trim() ||
              null,
            visits: 0,
            nextVisitFree: false,
            userRoles: {
              create: roles.map((role) => ({
                roleId: role.id,
              })),
            },
          },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        // Verification logic
        const verifyUserData = (dbUser: any) => {
          if (!dbUser) {
            throw new Error("User not found after operation");
          }

          // Solo verificar si hay valores nuevos que actualizar
          if (
            user.given_name !== undefined &&
            user.given_name !== dbUser.firstName
          ) {
            console.error(
              `FirstName mismatch: expected ${user.given_name}, got ${dbUser.firstName}`
            );
            return false;
          }

          if (
            user.family_name !== undefined &&
            user.family_name !== dbUser.lastName
          ) {
            console.error(
              `LastName mismatch: expected ${user.family_name}, got ${dbUser.lastName}`
            );
            return false;
          }

          // Verify roles
          const expectedRoles = new Set(user.roles || ["user"]);
          const actualRoles = new Set(
            dbUser.userRoles.map((ur: any) => ur.role.key)
          );

          const missingRoles = [...expectedRoles].filter(
            (r) => !actualRoles.has(r)
          );
          const extraRoles = [...actualRoles].filter(
            (r) => !expectedRoles.has(r)
          );

          if (missingRoles.length > 0 || extraRoles.length > 0) {
            console.error(
              `Role mismatch: missing ${missingRoles.join(", ")}, extra ${extraRoles.join(", ")}`
            );
            return false;
          }

          return true;
        };

        if (!verifyUserData(dbUser)) {
          throw new Error("User data not saved correctly");
        }

        return dbUser;
      });

      return result;
    } catch (dbError) {
      console.error(
        `Attempt ${attempt}: Error in createOrUpdateUser:`,
        dbError
      );
      if (attempt === maxRetries) {
        throw dbError;
      }
      // Add a small delay between retries
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }
  throw new Error("Failed to create or update user after max retries");
}

export async function POST(req: Request) {
  try {
    const token = await req.text();
    console.log("Received token:", token.substring(0, 20) + "...");

    const jwtDecoded = jwt.decode(token, { complete: true });
    if (!jwtDecoded) {
      console.error("Failed to decode JWT");
      return NextResponse.json({
        status: 500,
        statusText: "error decoding jwt",
      });
    }

    console.log("JWT decoded successfully");
    const header = jwtDecoded.header;
    const kid = header.kid;

    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const event = jwt.verify(token, signingKey) as KindeEvent;

    console.log("Event type:", event?.type);

    switch (event?.type) {
      case "user.created":
      case "user.updated":
        const user = event.data.user;
        console.log("User data received:", JSON.stringify(user, null, 2));

        const userDataForDb = {
          id: user.id,
          email: user.email,
          given_name: user.given_name,
          family_name: user.family_name,
          phone: user.phone_number,
          roles: user.roles?.map((role: KindeRole) => role.key) || ["user"],
        };

        const updatedUser = await createOrUpdateUser(userDataForDb);
        console.log(
          "User upserted in database:",
          JSON.stringify(updatedUser, null, 2)
        );
        break;
      default:
        console.log("Event not handled:", event.type);
        break;
    }

    return NextResponse.json({ status: 200, statusText: "success" });
  } catch (err) {
    console.error("Error in webhook:", err);
    if (err instanceof Error) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
