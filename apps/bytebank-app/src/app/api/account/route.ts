import { makeGetAccountOverview } from "@/composition/container";
import { toAccountOverviewDto } from "@/lib/serializers/account";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session.backendToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const overview = await makeGetAccountOverview().execute(session.backendToken);

    if (!overview) {
      return Response.json(
        { error: "Falha ao carregar conta" },
        { status: 502 },
      );
    }

    return Response.json(toAccountOverviewDto(overview), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Serviço indisponível" },
      { status: 502 },
    );
  }
}
