// src/lib/kinde-config.ts

export const kindeConfig = {
  // Configuración básica
  loginUrl: "/api/auth/login",
  logoutUrl: "/api/auth/logout",
  redirectUrl: "/admin",
  
  // Configuración de cookies
  cookies: {
    // Duración de las cookies en segundos
    // 30 días para las cookies de sesión
    sessionCookieLifetime: 30 * 24 * 60 * 60,
    // Configuración de seguridad para las cookies
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' para desarrollo local
    secure: process.env.NODE_ENV === 'production', // false en desarrollo para localhost
    httpOnly: true,
    // No configurar domain para localhost
    domain: process.env.NODE_ENV === 'production' ? process.env.KINDE_COOKIE_DOMAIN : undefined,
  },
  
  // Scopes para la autenticación
  scope: 'openid profile email offline',
  
  // Configuración de tokens
  tokenLifetime: {
    // Duración del token de acceso en segundos (2 horas)
    accessToken: 2 * 60 * 60,
    // Duración del token de refresco en segundos (30 días)
    refreshToken: 30 * 24 * 60 * 60,
    // Rotación de tokens de refresco (más seguro)
    enableRefreshTokenRotation: true,
  },
  
  // Configuración de estado - Aumentar tiempo para debugging
  stateOptions: {
    expiresIn: 15 * 60, // 15 minutos para el estado de autenticación (aumentado para debugging)
  },
  
  // Configuración de redirección
  redirects: {
    // Asegurar que las redirecciones funcionen correctamente en producción
    login: {
      defaultRedirectUrl: '/admin',
    },
    logout: {
      defaultRedirectUrl: '/',
    }
  }
};
