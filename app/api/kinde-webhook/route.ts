// app/api/kinde-webhook/route.ts

import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';

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
  email: string;
  given_name?: string;
  family_name?: string;
  roles?: KindeRole[];
}

interface KindeEvent extends JwtPayload {
  type: string;
  data: {
    user: KindeUser;
  };
}

export async function POST(req: Request) {
  console.log("Webhook received a POST request");
  
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
        
        const kindeId = user.id;
        const email = user.email;
        const firstName = user.given_name ?? null;
        const lastName = user.family_name ?? null;
        const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || null);
        const roles = user.roles?.map((role: KindeRole) => role.key) || ['user'];
        
        const updatedUser = await prisma.user.upsert({
          where: { kindeId: kindeId },
          create: {
            kindeId,
            email,
            firstName,
            lastName,
            name,
            roles,
          },
          update: {
            email,
            firstName,
            lastName,
            name,
            roles,
          },
        });
        
        console.log("User upserted in database:", JSON.stringify(updatedUser, null, 2));
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
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}