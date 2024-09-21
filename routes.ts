export const routes = {
  public: [
    "/",
    "/new-verification"
  ],
  auth: [
    "/signin",
    "/register",
    "/reset",
    "/new-password",
    "/error"
  ],
  apiAuthPrefix: "/api/auth",
  defaultLoginRedirect: "/settings",
  defaultLogoutRedirect: "/signin"
}