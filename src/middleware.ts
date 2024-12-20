// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

const PUBLIC_PATHS = ['/', '/blog', '/promociones'];

// Definir la interfaz para el contexto de autorización
interface AuthorizationContext {
  token: {
    sub?: string;
    aud?: string[];
    exp?: number;
    iat?: number;
    iss?: string;
    [key: string]: unknown;
  } | null;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Manejar rutas de autenticación específicamente
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  return withAuth(req, {
    isReturnToCurrentPage: true,
    loginPage: "/api/auth/login",
    publicPaths: PUBLIC_PATHS,
    isAuthorized: ({ token }: AuthorizationContext) => {
      return !!token;
    }
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};