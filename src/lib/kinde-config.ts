// src/lib/kinde-config.ts

export const kindeConfig = {
  // Configuración básica
  loginUrl: "/api/auth/login",
  logoutUrl: "/api/auth/logout",
  redirectUrl: "/admin",
  
  // Configuración de cookies
  cookies: {
    // Duración de la sesión (2 horas en segundos)
    sessionDurationInSeconds: 7200,
    
    // Opciones de seguridad para cookies
    sameSite: "lax", // Opciones: strict, lax, none
    secure: true,    // true para HTTPS
    httpOnly: true,  // Previene acceso desde JavaScript
    
    // Dominio y path
    domain: undefined, // undefined usará el dominio actual
    path: "/",
  },
  
  // Opciones de estado para OAuth
  stateOptions: {
    expiresIn: 300, // 5 minutos
  },
  
  // Configuración de autenticación
  auth: {
    // Incluir scope offline para obtener refresh tokens
    scope: "openid profile email offline",
    
    // Configuración de tokens
    tokens: {
      // Habilitar rotación de refresh tokens
      enableRefreshTokenRotation: true,
      
      // Tiempo de vida del refresh token (30 días en segundos)
      refreshTokenLifetime: 30 * 24 * 60 * 60,
      
      // Tiempo de vida del access token (1 hora en segundos)
      accessTokenLifetime: 60 * 60,
    }
  }
};
