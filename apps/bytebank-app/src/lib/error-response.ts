import { isUnauthorizedError } from "@bytebank/core";

/**
 * Traduz os erros tipados do core para respostas do BFF.
 *
 * - UnauthorizedError -> 401 (a UI/RTK Query decide redirecionar para o login)
 * - BackendUnavailableError (ou qualquer outro erro) -> 502 (erro de infraestrutura)
 *
 * Usa o guard do core (instanceof + `code`) para continuar correto mesmo se o
 * pacote for duplicado no bundle.
 */
export function toErrorResponse(error: unknown): Response {
  if (isUnauthorizedError(error)) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  return Response.json({ error: "Serviço indisponível" }, { status: 502 });
}
