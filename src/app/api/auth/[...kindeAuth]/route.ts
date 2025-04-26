import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { kindeConfig } from "@/lib/kinde-config";

const authConfig = {
  logout: {
    returnToPath: kindeConfig.redirectUrl || "/",
  },
  login: {
    returnToPath: kindeConfig.redirectUrl || "/admin/inventario",
    stateOptions: kindeConfig.stateOptions,
    // Incluir scope offline para obtener refresh tokens
    scope: kindeConfig.auth.scope,
  },
  cookies: kindeConfig.cookies,
  // Configuraciu00f3n de tokens
  tokens: kindeConfig.auth.tokens,
};

console.log('[Kinde Auth Config]', JSON.stringify(authConfig, null, 2));

export const GET = handleAuth(authConfig);
export const POST = handleAuth(authConfig);