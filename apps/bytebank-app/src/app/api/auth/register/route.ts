import type { CreateUserResponse } from "@bytebank/types";

import { fetchBackend } from "@/lib/backend-fetch";
import { isAllowedOrigin } from "@/lib/same-origin";

const USERNAME_MIN = 3;
const USERNAME_MAX = 80;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 6;
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
  const username =
    typeof body?.username === "string" ? body.username.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (
    username.length < USERNAME_MIN ||
    username.length > USERNAME_MAX ||
    !email ||
    email.length > EMAIL_MAX ||
    !email.includes("@") ||
    password.length < PASSWORD_MIN ||
    password.length > PASSWORD_MAX
  ) {
    return jsonError("Dados inválidos", 400);
  }

  let response: Response;
  try {
    response = await fetchBackend("/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
  } catch {
    return jsonError("Serviço indisponível", 502);
  }

  if (!response.ok) {
    return jsonError("Falha ao cadastrar", response.status >= 500 ? 502 : 400);
  }

  const json = (await response.json().catch(() => null)) as CreateUserResponse | null;
  const user = json?.result;

  if (
    !user ||
    typeof user.id !== "string" ||
    typeof user.username !== "string" ||
    typeof user.email !== "string"
  ) {
    return jsonError("Resposta inválida do backend", 502);
  }

  return Response.json(
    { user: { id: user.id, username: user.username, email: user.email } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
