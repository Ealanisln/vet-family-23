import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

// Handler personalizado con logging para debug
async function debugHandler(request: NextRequest, params: { kindeAuth: string[] }) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  console.log(`[Kinde Auth Debug] ${request.method} ${pathname}`);
  console.log(`[Kinde Auth Debug] Params:`, params);
  console.log(`[Kinde Auth Debug] Query params:`, Object.fromEntries(url.searchParams));
  
  // Log cookies entrantes
  const cookies = request.cookies.getAll();
  console.log(`[Kinde Auth Debug] Incoming cookies:`, cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
  
  // Log específico para cookies de Kinde
  const kindeCookies = cookies.filter(c => 
    c.name.toLowerCase().includes('kinde') || 
    c.name.toLowerCase().includes('state') ||
    c.name.toLowerCase().includes('oauth') ||
    c.name.toLowerCase().includes('auth')
  );
  console.log(`[Kinde Auth Debug] Auth-related cookies:`, kindeCookies);
  
  // Verificar si es callback y tenemos state
  if (pathname.includes('kinde_callback')) {
    const state = url.searchParams.get('state');
    const code = url.searchParams.get('code');
    console.log(`[Kinde Auth Debug] Callback - State: ${state}, Code: ${code?.substring(0, 20)}...`);
    console.log(`[Kinde Auth Debug] Looking for state cookie with value: ${state}`);
  }
  
  // Si es login, vamos a logear qué cookies se van a establecer
  if (pathname.includes('login') && !pathname.includes('callback')) {
    console.log(`[Kinde Auth Debug] Login initiated, monitoring cookie creation...`);
  }
  
  return null; // Continuar con el handler normal
}

export async function GET(request: NextRequest, context: { params: { kindeAuth: string[] } }) {
  await debugHandler(request, context.params);
  
  try {
    // Usar configuración completamente básica
    const handler = handleAuth();
    const response = await handler(request, context);
    
    // Log de cookies salientes
    if (response && response.headers) {
      const setCookieHeaders = response.headers.getSetCookie?.() || [];
      console.log(`[Kinde Auth Debug] Set-Cookie headers:`, setCookieHeaders);
    }
    
    return response;
  } catch (error) {
    console.error(`[Kinde Auth Debug] Error in GET handler:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest, context: { params: { kindeAuth: string[] } }) {
  await debugHandler(request, context.params);
  
  try {
    // Usar configuración completamente básica
    const handler = handleAuth();
    const response = await handler(request, context);
    
    // Log de cookies salientes
    if (response && response.headers) {
      const setCookieHeaders = response.headers.getSetCookie?.() || [];
      console.log(`[Kinde Auth Debug] Set-Cookie headers:`, setCookieHeaders);
    }
    
    return response;
  } catch (error) {
    console.error(`[Kinde Auth Debug] Error in POST handler:`, error);
    throw error;
  }
}