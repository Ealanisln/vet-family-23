import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { kindeConfig } from "@/lib/kinde-config";

const authConfig = {
  logout: {
    returnToPath: kindeConfig.redirectUrl || "/",
  },
  login: {
    returnToPath: kindeConfig.redirectUrl || "/admin/inventario",
    stateOptions: kindeConfig.stateOptions,
  },
  cookies: kindeConfig.cookies,
};

export const GET = handleAuth(authConfig);
export const POST = handleAuth(authConfig);