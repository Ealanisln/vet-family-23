import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    let user = null;
    let authStatus = false;
    let dbUser = null;

    try {
      user = await getUser();
      console.log("User fetched successfully:", user);
    } catch (userError) {
      console.error("Error fetching user:", userError instanceof Error ? userError.message : String(userError));
    }
    
    try {
      authStatus = await isAuthenticated();
      console.log("Auth status fetched successfully:", authStatus);
    } catch (authError) {
      console.error("Error checking auth status:", authError instanceof Error ? authError.message : String(authError));
    }

    if (user && user.id) {
      try {
        dbUser = await prisma.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email || undefined,
          },
          create: {
            kindeId: user.id,
            email: user.email || '',
          },
        });
        console.log("User updated/created in database:", dbUser);
      } catch (dbError) {
        console.error("Error updating/creating user in database:", dbError instanceof Error ? dbError.message : String(dbError));
      }
    }

    return NextResponse.json({ user, isAuthenticated: authStatus, dbUser });
  } catch (error) {
    console.error("Error in auth-status API route:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}