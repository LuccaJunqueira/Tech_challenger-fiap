/**
 * Erros de domínio/aplicação que atravessam a fronteira do core sem depender
 * de HTTP, Next ou de qualquer detalhe de transporte.
 *
 * - UnauthorizedError: a credencial da sessão está ausente ou foi rejeitada.
 * - BackendUnavailableError: o backend não respondeu ou respondeu de forma
 *   inesperada (falha de rede, timeout, 5xx, payload inválido).
 *
 * O campo `code` é o discriminante estável: continua válido se o pacote for
 * duplicado no bundle ou se o erro atravessar uma fronteira de serialização.
 * Os guards abaixo checam `instanceof` primeiro e caem no `code` depois.
 */
export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED" as const;

  constructor(message = "Não autenticado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BackendUnavailableError extends Error {
  readonly code = "BACKEND_UNAVAILABLE" as const;

  constructor(message = "Serviço indisponível") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

type CodedError = { code?: unknown };

export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return (
    error instanceof UnauthorizedError ||
    (error instanceof Error && (error as CodedError).code === "UNAUTHORIZED")
  );
}

export function isBackendUnavailableError(
  error: unknown,
): error is BackendUnavailableError {
  return (
    error instanceof BackendUnavailableError ||
    (error instanceof Error &&
      (error as CodedError).code === "BACKEND_UNAVAILABLE")
  );
}
