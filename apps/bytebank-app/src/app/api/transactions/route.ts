import { makeGetAccountOverview } from "@/composition/container";
import { fetchBackend } from "@/lib/backend-fetch";
import { isAllowedOrigin } from "@/lib/same-origin";
import { getSession } from "@/lib/session";
import { parseTransactionInput } from "@/lib/validation/transaction";

function mapBackendError(status: number, message: string): Response {
  if (status === 400 || status === 422) {
    return Response.json({ error: message }, { status: 400 });
  }
  if (status === 401) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (status === 404) {
    return Response.json({ error: "Não encontrado" }, { status: 404 });
  }
  return Response.json({ error: "Serviço indisponível" }, { status: 502 });
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 });
  }

  const session = await getSession();

  if (!session.backendToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseTransactionInput(body);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const overview = await makeGetAccountOverview().execute(session.backendToken);
    const accountId = overview?.account?.id;

    if (!accountId) {
      return Response.json({ error: "Conta não encontrada" }, { status: 404 });
    }

    const response = await fetchBackend("/account/transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.backendToken}`,
      },
      body: JSON.stringify({ accountId, ...parsed.data }),
    });

    if (!response.ok) {
      return mapBackendError(response.status, "Falha ao criar transação");
    }

    const json = await response.json().catch(() => null);
    const transaction = json?.result;

    if (!transaction) {
      return Response.json(
        { error: "Resposta inválida do backend" },
        { status: 502 },
      );
    }

    return Response.json({ result: transaction }, { status: response.status });
  } catch {
    return Response.json(
      { error: "Serviço indisponível" },
      { status: 502 },
    );
  }
}
