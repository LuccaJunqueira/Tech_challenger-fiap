import type { LoginResponse } from "@bytebank/types";

import { fetchBackend } from "@/lib/backend-fetch";
import { isAllowedOrigin } from "@/lib/same-origin";
import { getSession } from "@/lib/session";

const EMAIL_MAX = 254;
const PASSWORD_MAX = 128;

function jsonError(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return jsonError("Origem inválida", 403);
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (
    !email ||
    email.length > EMAIL_MAX ||
    !email.includes("@") ||
    !password ||
    password.length > PASSWORD_MAX
  ) {
    return jsonError("Credenciais obrigatórias", 400);
  }

  let response: Response;
  try {
    response = await fetchBackend("/user/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return jsonError("Serviço indisponível", 502);
  }

  if (response.status === 401 || response.status === 400) {
    return jsonError("Credenciais inválidas", 401);
  }

  if (!response.ok) {
    return jsonError("Serviço indisponível", 502);
  }

  const json = (await response.json().catch(() => null)) as LoginResponse | null;
  const token = json?.result?.token;

  if (typeof token !== "string" || !token) {
    return jsonError("Resposta inválida do backend", 502);
  }

  try {
    const session = await getSession();
    session.backendToken = token;
    await session.save();
  } catch {
    return jsonError("Falha ao criar sessão", 500);
  }

  return Response.json(
    { authenticated: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
