import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  console.log("🔍 [KINDE-FULL-DEBUG] Starting comprehensive Kinde debugging...");
  
  try {
    // 1. Check cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const kindeCookies = allCookies.filter(cookie => 
      cookie.name.includes('kinde') || 
      cookie.name.includes('session') ||
      cookie.name.includes('auth')
    );

    console.log("🔍 [KINDE-FULL-DEBUG] Relevant cookies:", kindeCookies.map(c => ({
      name: c.name,
      hasValue: !!c.value,
      valueLength: c.value?.length || 0
    })));

    // 2. Try to get Kinde session
    const session = getKindeServerSession();
    
    // 3. Try to get user
    let user = null;
    let userError = null;
    try {
      user = await session.getUser();
      console.log("🔍 [KINDE-FULL-DEBUG] User result:", user);
    } catch (error) {
      userError = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ [KINDE-FULL-DEBUG] Error getting user:", error);
    }

    // 4. Try to get authentication status
    let isAuthenticated = null;
    let authError = null;
    try {
      isAuthenticated = await session.isAuthenticated();
      console.log("🔍 [KINDE-FULL-DEBUG] Authentication status:", isAuthenticated);
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ [KINDE-FULL-DEBUG] Error checking authentication:", error);
    }

    // 5. Try to get roles
    let roles = null;
    let rolesError = null;
    try {
      roles = await session.getRoles();
      console.log("🔍 [KINDE-FULL-DEBUG] Roles result:", roles);
    } catch (error) {
      rolesError = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ [KINDE-FULL-DEBUG] Error getting roles:", error);
    }

    // 6. Try to get access token
    let accessToken = null;
    let tokenError = null;
    try {
      accessToken = await session.getAccessToken();
      console.log("🔍 [KINDE-FULL-DEBUG] Access token present:", !!accessToken);
      if (accessToken && typeof accessToken === 'object') {
        console.log("🔍 [KINDE-FULL-DEBUG] Access token keys:", Object.keys(accessToken));
      }
    } catch (error) {
      tokenError = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ [KINDE-FULL-DEBUG] Error getting access token:", error);
    }

    // 7. Check environment variables
    const envCheck = {
      KINDE_CLIENT_ID: !!process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: !!process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: !!process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: !!process.env.KINDE_SITE_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: !!process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: !!process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    const response = {
      cookies: {
        total: allCookies.length,
        kindeRelated: kindeCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value,
          valueLength: c.value?.length || 0
        }))
      },
      user: {
        data: user,
        error: userError
      },
      authentication: {
        status: isAuthenticated,
        error: authError
      },
      roles: {
        data: roles,
        error: rolesError
      },
      accessToken: {
        present: !!accessToken,
        type: typeof accessToken,
        error: tokenError
      },
      environment: envCheck,
      timestamp: new Date().toISOString()
    };

    console.log("✅ [KINDE-FULL-DEBUG] Complete debug response:", JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ [KINDE-FULL-DEBUG] Critical error in debugging:", error);
    return NextResponse.json({
      error: "Critical debugging error",
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
