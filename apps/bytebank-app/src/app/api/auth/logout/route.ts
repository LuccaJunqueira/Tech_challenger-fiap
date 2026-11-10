import { isAllowedOrigin } from "@/lib/same-origin";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 });
  }

  const session = await getSession();
  session.destroy();

  return Response.json(
    { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
