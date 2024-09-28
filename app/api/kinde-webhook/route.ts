import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const client = jwksClient({
  jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

export async function POST(req: Request) {
  try {
    // Get the token from the request
    const token = await req.text();

    // Decode the token
    const jwtDecoded = jwt.decode(token, { complete: true });
    if (!jwtDecoded) {
      return NextResponse.json({
        status: 500,
        statusText: "error decoding jwt",
      });
    }

    const header = jwtDecoded.header;
    const kid = header.kid;

    // Verify the token
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const event = jwt.verify(token, signingKey) as JwtPayload;

    // Handle various events
    switch (event?.type) {
      case "user.created":
        // create a user in our database
        const user = event.data.user;
        const kindeId = user.id;
        const email = user.email;
        const firstName = user.given_name || null;
        const lastName = user.family_name || null;
        const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || null);

        const newUser = await prisma.user.create({
          data: {
            kindeId,
            email,
            firstName,
            lastName,
            name,
          },
        });

        console.log("[newUser]", newUser);
        break;
      default:
        console.log("event not handled", event.type);
        break;
    }

    return NextResponse.json({ status: 200, statusText: "success" });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  } finally {
    await prisma.$disconnect();
  }
}