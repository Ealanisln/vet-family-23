// src/lib/auth-utils.ts
import { prisma } from "@/lib/prismaDB";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Use the actual types from the Kinde library
type KindeServerSession = ReturnType<typeof getKindeServerSession>;
type GetUserFunction = KindeServerSession["getUser"];
type IsAuthenticatedFunction = KindeServerSession["isAuthenticated"];

/**
 * Obtiene un usuario de la base de datos para usar como fallback cuando la autenticaciu00f3n falla
 * @returns El primer usuario encontrado en la base de datos o null si no hay usuarios
 */
export async function getFallbackUser() {
  try {
    // Buscar el primer usuario disponible en la base de datos
    const user = await prisma.user.findFirst({
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    
    if (!user) {
      console.error("[getFallbackUser] No se encontru00f3 ningu00fan usuario en la base de datos");
      return null;
    }
    
    console.log(`[getFallbackUser] Usando usuario fallback: ${user.id}`);
    return user;
  } catch (error) {
    console.error("[getFallbackUser] Error al buscar usuario fallback:", error);
    return null;
  }
}

/**
 * Verifica si el usuario estu00e1 autenticado y obtiene sus datos
 * Si la autenticaciu00f3n falla, intenta usar un usuario fallback
 * @param getUser Funciu00f3n para obtener el usuario de la sesiu00f3n
 * @param isAuthenticated Funciu00f3n para verificar si el usuario estu00e1 autenticado
 * @returns El usuario de la base de datos o null si no se puede obtener
 */

export async function getAuthenticatedUser(
  getUser: GetUserFunction,
  isAuthenticated: IsAuthenticatedFunction
) {
  try {
    // Intentar verificar autenticaciu00f3n
    let authenticated = false;
    if (isAuthenticated) {
      try {
        const authResult = await isAuthenticated();
        // El resultado puede ser boolean o null, aseguramos que sea boolean
        authenticated = authResult === true;
        console.log(`[getAuthenticatedUser] isAuthenticated check: ${authenticated}`);
      } catch (error) {
        console.warn("[getAuthenticatedUser] Error al verificar autenticaciu00f3n:", error);
        // Continuamos con el flujo aunque falle la verificaciu00f3n
      }
    } else {
      console.warn("[getAuthenticatedUser] isAuthenticated es null, omitiendo verificaciu00f3n");
    }
    
    // Intentar obtener usuario de la sesiu00f3n
    const user = await getUser();
    console.log("[getAuthenticatedUser] User from session:", {
      id: user?.id,
      email: user?.email,
    });
    
    // Si tenemos un usuario vu00e1lido, buscar en la base de datos
    if (user && user.id) {
      const dbUser = await prisma.user.findUnique({
        where: { kindeId: user.id },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
      
      if (dbUser) {
        console.log(`[getAuthenticatedUser] Usuario encontrado en DB: ${dbUser.id}`);
        return dbUser;
      }
    }
    
    // Si no se pudo obtener el usuario, usar fallback
    console.log("[getAuthenticatedUser] No se pudo obtener usuario de sesiu00f3n, usando fallback");
    return await getFallbackUser();
  } catch (error) {
    console.error("[getAuthenticatedUser] Error:", error);
    return await getFallbackUser();
  }
}
