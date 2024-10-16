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

async function createOrUpdateUser(user: any, maxRetries = 5) {
  console.log(
    "Starting createOrUpdateUser with user data:",
    JSON.stringify(user, null, 2)
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(async (prisma) => {
        const dbUser = await prisma.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name: `${user.given_name} ${user.family_name}`.trim(),
            roles: user.roles || ["user"],
          },
          create: {
            kindeId: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.given_name,
            lastName: user.family_name,
            name: `${user.given_name} ${user.family_name}`.trim(),
            roles: user.roles || ["user"],
            visits: 0,
            nextVisitFree: false,
          },
        });

        console.log(
          `Attempt ${attempt}: User operation completed. Returned user data:`,
          JSON.stringify(dbUser, null, 2)
        );

        // Immediate verification
        const verifiedUser = await prisma.user.findUnique({
          where: { kindeId: user.id },
        });
        console.log(
          `Attempt ${attempt}: Verified user data from database:`,
          JSON.stringify(verifiedUser, null, 2)
        );

        if (
          !verifiedUser ||
          verifiedUser.firstName !== user.given_name ||
          verifiedUser.lastName !== user.family_name
        ) {
          throw new Error("User data not saved correctly");
        }

        return verifiedUser;
      });

      // Final verification (without delay)
      const finalVerifiedUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
      });
      console.log(
        `Attempt ${attempt}: Final verified user data:`,
        JSON.stringify(finalVerifiedUser, null, 2)
      );

      if (
        !finalVerifiedUser ||
        finalVerifiedUser.firstName !== user.given_name ||
        finalVerifiedUser.lastName !== user.family_name
      ) {
        throw new Error("User data not consistent after final verification");
      }

      return finalVerifiedUser;
    } catch (dbError) {
      console.error(
        `Attempt ${attempt}: Error in createOrUpdateUser:`,
        dbError
      );
      if (attempt === maxRetries) {
        throw dbError;
      }
      // No delay between retries
    }
  }
  throw new Error("Failed to create or update user after max retries");
}