// ─── Nome da chave do cookie JWT ─────────────────────────────────────────────
// Usado tanto no cliente (js-cookie) quanto no servidor (next/headers cookies()).
// Manter como única fonte de verdade para evitar inconsistência entre SSR e CSR.
export const JWT_COOKIE_NAME = "jwt_token";

// ─── Configuração do cookie ──────────────────────────────────────────────────
// Usado pelo js-cookie no cliente. NÃO é httpOnly (impossível via JS client-side).
// O backend NÃO seta esse cookie — ele continua retornando o token no body JSON.
// Quem seta/remove é o frontend, via authSlice (setCredentials / logout).
// Para SSR via Server Components, usar cookies() de next/headers com o mesmo nome.
export const getJwtCookieOptions = () => ({
  expires: new Date(Date.now() + 20 * 60 * 1000), // 20 minutos (tokens JWT do backend expiram em 1h)
  path: "/",
  sameSite: "lax" as const,
});
