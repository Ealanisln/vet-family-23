import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

function generateUserHash(user: any) {
  return createHash("md5").update(JSON.stringify(user)).digest("hex");
}

async function createOrUpdateUser(user: any) {
  const userHash = generateUserHash(user);

  try {
    const dbUser = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { kindeId: user.id },
      });

      if (!existingUser || generateUserHash(existingUser) !== userHash) {
        return tx.user.upsert({
          where: { kindeId: user.id },
          update: {
            email: user.email || undefined,
            firstName: user.given_name || undefined,
            lastName: user.family_name || undefined,
            name:
              user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.given_name || user.family_name || undefined,
          },
          create: {
            kindeId: user.id,
            email: user.email || "",
            firstName: user.given_name || null,
            lastName: user.family_name || null,
            name:
              user.given_name && user.family_name
                ? `${user.given_name} ${user.family_name}`
                : user.given_name || user.family_name || null,
          },
        });
      }

      return existingUser;
    });

    console.log("User operation completed:", dbUser);
    return dbUser;
  } catch (dbError) {
    console.error("Error in createOrUpdateUser:", dbError);
    throw dbError; // Re-throw to handle in the main function
  }
}

export async function GET(req: NextRequest) {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();

    // Rate limiting
    const ip = req.ip || "unknown";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    const requestRecord = requestCounts.get(ip) || { count: 0, timestamp: now };

    if (requestRecord.timestamp < windowStart) {
      requestRecord.count = 0;
      requestRecord.timestamp = now;
    }

    requestRecord.count++;
    requestCounts.set(ip, requestRecord);

    if (requestRecord.count > MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    let user = null;
    let authStatus = false;
    let dbUser = null;

    // Check cache
    const cacheKey = `user_${ip}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data);
    }

    try {
      user = await getUser();
      authStatus = await isAuthenticated();
    } catch (error) {
      console.error("Error fetching user or auth status:", error);
      return NextResponse.json(
        { error: "Authentication service error" },
        { status: 500 }
      );
    }

    if (user && user.id) {
      try {
        dbUser = await createOrUpdateUser(user);
      } catch (dbError) {
        console.error("Error in database operation:", dbError);
        return NextResponse.json(
          { error: "Database operation failed" },
          { status: 500 }
        );
      }
    }

    const responseData = { user, isAuthenticated: authStatus, dbUser };

    // Update cache
    cache.set(cacheKey, { data: responseData, timestamp: now });
    return NextResponse.json(responseData);
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
