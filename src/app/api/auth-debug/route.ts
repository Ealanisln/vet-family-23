import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prismaDB";

export async function GET() {
  try {
    const { getUser, getRoles, isAuthenticated } = getKindeServerSession();
    
    const [user, roles, authenticated] = await Promise.allSettled([
      getUser(),
      getRoles(),
      isAuthenticated()
    ]);

    const kindeUser = user.status === 'fulfilled' ? user.value : null;
    const kindeRoles = roles.status === 'fulfilled' ? roles.value : null;
    const isAuth = authenticated.status === 'fulfilled' ? authenticated.value : false;

    let dbUser = null;
    if (kindeUser?.id) {
      try {
        dbUser = await prisma.user.findUnique({
          where: { kindeId: kindeUser.id },
          include: {
            UserRole: {
              include: {
                Role: true
              }
            }
          }
        });
      } catch (error) {
        console.error("Error fetching user from database:", error);
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      authenticated: isAuth,
      kinde: {
        user: kindeUser ? {
          id: kindeUser.id,
          email: kindeUser.email,
          given_name: kindeUser.given_name,
          family_name: kindeUser.family_name
        } : null,
        roles: kindeRoles,
        userStatus: user.status,
        rolesStatus: roles.status,
        authStatus: authenticated.status
      },
      database: {
        user: dbUser ? {
          id: dbUser.id,
          kindeId: dbUser.kindeId,
          email: dbUser.email,
          roles: dbUser.UserRole.map(ur => ({
            key: ur.Role.key,
            name: ur.Role.name
          }))
        } : null
      },
      adminCheck: {
        kindeAdmin: kindeRoles?.some((role) => role.key === "admin") || false,
        dbAdmin: dbUser?.UserRole?.some((ur) => ur.Role.key === "admin") || false
      }
    });
  } catch (error) {
    console.error("Auth debug error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 