// app/api/auth/[kindeAuth]/route.ts
import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export const GET = handleAuth({
  logout: {
    returnToPath: "/",
  },
  login: {
    returnToPath: "/admin/inventario",
    // Configuración adicional para manejar el state
    stateOptions: {
      // Aumentar el tiempo de expiración del state
      expiresIn: 5 * 60, // 5 minutos
    },
  },
});