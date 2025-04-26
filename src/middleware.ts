import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = ['/', '/blog', '/promociones'];
const AUTH_PATHS = ['/api/auth'];
const STATIC_PATHS = ['/_next', '/assets', '/favicon.ico', '/images'];

// Función auxiliar para verificar si la ruta actual coincide con algún patrón
const matchesPath = (pathname: string, patterns: string[]) => {
  return patterns.some(path => pathname === path || pathname.startsWith(path));
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass inmediato para rutas estáticas y de autenticación
  if (
    matchesPath(pathname, [...STATIC_PATHS, ...AUTH_PATHS]) ||
    pathname.includes('.') // Bypass para archivos con extensión
  ) {
    return NextResponse.next();
  }

  // Bypass para rutas públicas
  if (matchesPath(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // Para rutas protegidas (/admin/*)
  if (pathname.startsWith('/admin')) {
    try {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user) {
        // Crear URL de login con returnTo
        const returnTo = encodeURIComponent(request.url);
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('post_login_redirect_url', returnTo);

        // Prevenir ciclos de redirección verificando si ya estamos en una URL de login
        const currentUrl = new URL(request.url);
        if (currentUrl.searchParams.has('post_login_redirect_url')) {
          return NextResponse.redirect(new URL('/api/auth/login', request.url));
        }

        return NextResponse.redirect(loginUrl);
      }

      // Usuario autenticado, configurar headers
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    } catch (error) {
      console.error('Auth error:', error);
      // En caso de error, redirigir al login sin parámetros adicionales
      return NextResponse.redirect(new URL('/api/auth/login', request.url));
    }
  }

  // Permitir todas las demás rutas
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rutas que requieren protección
    '/admin/:path*',
    '/api/pos/:path*', // Protege server actions del POS
    // Excluir archivos estáticos y assets
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
};