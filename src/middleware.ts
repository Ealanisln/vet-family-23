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

  // FIX: Mejorar manejo de rutas admin
  if (pathname.startsWith('/admin')) {
    try {
      const { getUser, isAuthenticated } = getKindeServerSession();
      
      // Obtener el estado de autenticación de manera más robusta
      const [authenticated, user] = await Promise.all([
        isAuthenticated().catch(() => false),
        getUser().catch(() => null)
      ]);

      // Solo redirigir si definitivamente no hay usuario
      if (!user && !authenticated) {
        // FIX: Evitar loops de redirección
        const referer = request.headers.get('referer');
        if (referer?.includes('/api/auth/')) {
          // Si viene de un proceso de auth, permitir el acceso
          return NextResponse.next();
        }

        const returnTo = encodeURIComponent(request.url);
        const loginUrl = new URL('/api/auth/login', request.url);
        loginUrl.searchParams.set('post_login_redirect_url', returnTo);
        
        return NextResponse.redirect(loginUrl);
      }

      // Configurar headers anti-cache para rutas admin
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      response.headers.set('x-middleware-cache', 'no-cache');
      return response;
      
    } catch (error) {
      console.error('❌ [MIDDLEWARE] Error checking auth:', error);
      // En caso de error, permitir el acceso para evitar bloqueos
      return NextResponse.next();
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