import { NextResponse } from 'next/server';
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  try {
    console.log('[KindeDebug] Starting Kinde configuration debug...');
    
    // Verificar variables de entorno críticas
    const envCheck = {
      KINDE_CLIENT_ID: !!process.env.KINDE_CLIENT_ID,
      KINDE_CLIENT_SECRET: !!process.env.KINDE_CLIENT_SECRET,
      KINDE_ISSUER_URL: !!process.env.KINDE_ISSUER_URL,
      KINDE_SITE_URL: !!process.env.KINDE_SITE_URL,
      KINDE_POST_LOGIN_REDIRECT_URL: !!process.env.KINDE_POST_LOGIN_REDIRECT_URL,
      KINDE_POST_LOGOUT_REDIRECT_URL: !!process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    };
    
    console.log('[KindeDebug] Environment variables check:', envCheck);
    
    // Verificar que handleAuth esté disponible
    let handleAuthStatus = 'unknown';
    let handleAuthError = null;
    
    try {
      if (typeof handleAuth !== 'function') {
        handleAuthStatus = 'not_function';
        handleAuthError = `handleAuth is ${typeof handleAuth}, expected function`;
      } else {
        handleAuthStatus = 'available';
        
        // Intentar crear un handler
        try {
          const handler = handleAuth();
          if (typeof handler === 'function') {
            handleAuthStatus = 'handler_created';
          } else {
            handleAuthStatus = 'handler_not_function';
            handleAuthError = `Handler is ${typeof handler}, expected function`;
          }
        } catch (handlerError) {
          handleAuthStatus = 'handler_creation_failed';
          handleAuthError = handlerError instanceof Error ? handlerError.message : 'Unknown error';
        }
      }
    } catch (error) {
      handleAuthStatus = 'error';
      handleAuthError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    console.log('[KindeDebug] handleAuth status:', handleAuthStatus);
    if (handleAuthError) {
      console.log('[KindeDebug] handleAuth error:', handleAuthError);
    }
    
    // Verificar configuración de cookies
    const cookieConfig = {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      domain: process.env.NODE_ENV === 'production' ? process.env.KINDE_COOKIE_DOMAIN : undefined,
    };
    
    console.log('[KindeDebug] Cookie configuration:', cookieConfig);
    
    // Verificar URLs de redirección
    const redirectUrls = {
      login: process.env.KINDE_POST_LOGIN_REDIRECT_URL || '/admin',
      logout: process.env.KINDE_POST_LOGOUT_REDIRECT_URL || '/',
      site: process.env.KINDE_SITE_URL || 'http://localhost:3000',
      issuer: process.env.KINDE_ISSUER_URL,
    };
    
    console.log('[KindeDebug] Redirect URLs:', redirectUrls);
    
    // Verificar si estamos en producción o desarrollo
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL_URL;
    
    console.log('[KindeDebug] Environment info:', {
      isProduction,
      isVercel,
      vercelUrl: process.env.VERCEL_URL,
    });
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'success',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isProduction,
        isVercel,
        vercelUrl: process.env.VERCEL_URL,
      },
      kinde: {
        configuration: envCheck,
        handleAuth: {
          status: handleAuthStatus,
          error: handleAuthError,
        },
        cookies: cookieConfig,
        redirects: redirectUrls,
      },
      recommendations: generateRecommendations(envCheck, handleAuthStatus, isProduction, isVercel),
    });
    
  } catch (error) {
    console.error('[KindeDebug] Error in debug route:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

function generateRecommendations(
  envCheck: Record<string, any>, 
  handleAuthStatus: string, 
  isProduction: boolean, 
  isVercel: boolean
): string[] {
  const recommendations: string[] = [];
  
  // Verificar variables de entorno faltantes
  if (!envCheck.KINDE_CLIENT_ID) {
    recommendations.push('KINDE_CLIENT_ID is missing - required for authentication');
  }
  
  if (!envCheck.KINDE_CLIENT_SECRET) {
    recommendations.push('KINDE_CLIENT_SECRET is missing - required for authentication');
  }
  
  if (!envCheck.KINDE_ISSUER_URL) {
    recommendations.push('KINDE_ISSUER_URL is missing - required for authentication');
  }
  
  if (!envCheck.KINDE_SITE_URL) {
    recommendations.push('KINDE_SITE_URL is missing - recommended for proper redirects');
  }
  
  // Verificar configuración de handleAuth
  if (handleAuthStatus === 'not_function') {
    recommendations.push('handleAuth is not available - check Kinde package installation');
  }
  
  if (handleAuthStatus === 'handler_creation_failed') {
    recommendations.push('Failed to create handler - check Kinde configuration');
  }
  
  // Verificar configuración de producción
  if (isProduction && !isVercel) {
    recommendations.push('Production environment detected but not on Vercel - verify deployment configuration');
  }
  
  if (isProduction && !envCheck.KINDE_POST_LOGIN_REDIRECT_URL) {
    recommendations.push('KINDE_POST_LOGIN_REDIRECT_URL should be set in production');
  }
  
  if (isProduction && !envCheck.KINDE_POST_LOGOUT_REDIRECT_URL) {
    recommendations.push('KINDE_POST_LOGOUT_REDIRECT_URL should be set in production');
  }
  
  // Si no hay problemas críticos
  if (recommendations.length === 0) {
    recommendations.push('Configuration appears to be correct');
  }
  
  return recommendations;
}
