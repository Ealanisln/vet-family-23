// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ['/', '/blog', '/promociones'];
const AUTH_PATHS = ['/api/auth'];
const STATIC_PATHS = ['/_next', '/assets', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (PUBLIC_PATHS.some(path => pathname === path)) {
    return NextResponse.next();
  }

  // Permitir rutas de autenticación y assets
  if (
    AUTH_PATHS.some(path => pathname.startsWith(path)) ||
    STATIC_PATHS.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }

  // Para rutas protegidas (/admin/*)
  if (pathname.startsWith('/admin')) {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user) {
        // Redireccionar al login con la URL de retorno
        const returnUrl = encodeURIComponent(request.url);
        return NextResponse.redirect(
          new URL(`/api/auth/login?post_login_redirect_url=${returnUrl}`, request.url)
        );
      }

      // Usuario autenticado, continuar
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      return response;
    } catch (error) {
      console.error('Auth error:', error);
      // En caso de error, redirigir al login
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }

  // Permitir todas las demás rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
