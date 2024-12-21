import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

const authConfig = {
  logout: {
    returnToPath: "/",
  },
  login: {
    returnToPath: "/admin/inventario",
    stateOptions: {
      expiresIn: 5 * 60, // 5 minutos
    },
  },
};

export const GET = handleAuth(authConfig);
export const POST = handleAuth(authConfig);