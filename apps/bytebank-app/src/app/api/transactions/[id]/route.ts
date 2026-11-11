import { mapTransaction } from "@/infrastructure/account/backend-account-mapper";
import { fetchBackend } from "@/lib/backend-fetch";
import { toErrorResponse } from "@/lib/error-response";
import { getAccountOverview } from "@/lib/getAccountOverview";
import { isAllowedOrigin } from "@/lib/same-origin";
import { toTransactionDto } from "@/lib/serializers/account";
import { getSession } from "@/lib/session";
import {
  isTransactionId,
  parseTransactionInput,
} from "@/lib/validation/transaction";

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

async function getOwnedTransaction(id: string) {
  const overview = await getAccountOverview();
  return overview?.transactions.find((transaction) => transaction.id === id);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 });
  }

  const session = await getSession();

  if (!session.backendToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  if (!isTransactionId(id)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseTransactionInput(body);

  if (!parsed.ok) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const owned = await getOwnedTransaction(id);

    if (!owned) {
      return Response.json(
        { error: "Transação não encontrada" },
        { status: 404 },
      );
    }

    const response = await fetchBackend(
      `/account/transaction/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendToken}`,
        },
        body: JSON.stringify(parsed.data),
      },
    );

    if (!response.ok) {
      return mapBackendError(response.status, "Falha ao atualizar");
    }

    const json = await response.json().catch(() => null);
    const transaction = json?.result;

    if (!transaction) {
      return Response.json(
        { error: "Resposta inválida do backend" },
        { status: 502 },
      );
    }

    return Response.json(toTransactionDto(mapTransaction(transaction)), {
      status: response.status,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAllowedOrigin(request)) {
    return Response.json({ error: "Origem inválida" }, { status: 403 });
  }

  const session = await getSession();

  if (!session.backendToken) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;

  if (!isTransactionId(id)) {
    return Response.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const owned = await getOwnedTransaction(id);

    if (!owned) {
      return Response.json(
        { error: "Transação não encontrada" },
        { status: 404 },
      );
    }

    const response = await fetchBackend(
      `/account/transaction/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.backendToken}` },
      },
    );

    if (!response.ok) {
      return mapBackendError(response.status, "Falha ao excluir");
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
