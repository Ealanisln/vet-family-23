// middleware.ts
import {
  authMiddleware,
  withAuth,
} from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req: Request) {
  return withAuth(req);
}

export const config = {
  matcher: [
    "/admin",
    "/inventory/:path*",  // Protect all inventory routes
    "/api/inventory/:path*"  // Protect inventory API routes
  ],
};