// middleware.ts
import { NextResponse } from 'next/server';
import {
  authMiddleware,
  withAuth,
} from "@kinde-oss/kinde-auth-nextjs/middleware";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function middleware(req: Request) {
  // Log the requested path
  console.log("[Middleware] Checking path:", req.url);

  // Check if it's an API route
  const isApiRoute = req.url.includes('/api/');
  
  try {
    const response = await withAuth(req);
    
    // If it's an API route and authentication fails, return JSON response
    if (isApiRoute && response.status === 307) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return response;
  } catch (error) {
    console.error("[Middleware] Auth error:", error);
    
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, error: "Authentication error" },
        { status: 401 }
      );
    }
    
    // Redirect to login for non-API routes
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",  // Proteger todas las rutas /admin
    "/inventory/:path*",
    "/api/inventory/:path*",
    "/admin/inventario/:path*"  // Específicamente proteger esta ruta también
  ],
};