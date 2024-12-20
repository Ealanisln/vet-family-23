// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ['/', '/blog', '/promociones'];

// Definir el tipo para el token
interface KindeToken {
  sub?: string;
  aud?: string[];
  exp?: number;
  iat?: number;
  iss?: string;
  [key: string]: unknown;
}

export default withAuth((req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas sin restricciones
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rutas de autenticación y assets, permitir sin restricciones
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  // Para rutas admin, asegurarse de que las cookies de sesión se manejen correctamente
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  return NextResponse.next();
}, {
  // Opciones de configuración de Kinde con tipos correctos
  isAuthorized: async (token: KindeToken | null) => {
    return !!token;
  },
  redirectToLogin: true,
  loginPage: "/api/auth/login",
  publicPaths: PUBLIC_PATHS
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};