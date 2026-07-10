export const JWT_COOKIE_NAME = "jwt_token";

export const getJwtCookieOptions = () => ({
  expires: new Date(Date.now() + 20 * 60 * 1000),
  path: "/",
  sameSite: "lax" as const,
});
