/**
 * Extrai uma mensagem segura (sempre string) de um erro desconhecido.
 *
 * O React não aceita objeto como filho (#31). Erros de transporte costumam
 * chegar em formatos diferentes:
 *
 * - RTK Query: `{ status, data }`, com `data` sendo `{ error }` ou `{ message }`
 * - Erros aninhados: `{ data: { error: { message, code } } }`
 * - `Error` nativo: `{ message }`
 * - String crua (corpo de resposta não-JSON)
 *
 * Esta função nunca devolve objeto e nunca repassa texto técnico (stack,
 * `ECONNREFUSED`, `TypeError: ...`, HTML). Se não achar uma mensagem segura,
 * usa o `fallback`.
 */

const DEFAULT_FALLBACK = "Algo deu errado. Tente novamente.";
const NETWORK_MESSAGE =
  "Não foi possível conectar. Verifique sua internet e tente novamente.";

const MAX_MESSAGE_LENGTH = 160;

// Texto técnico que não deve chegar ao usuário (decisão do runbook 03).
const TECHNICAL_PATTERNS: RegExp[] = [
  /\bError\b/,
  /\bE(?:CONNREFUSED|CONNRESET|NOTFOUND|TIMEDOUT|HOSTUNREACH|NETUNREACH|AI_AGAIN)\b/,
  /failed to fetch/i,
  /fetch failed/i,
  /load failed/i,
  /network ?error/i,
  /\bat\s+[\w$.<>]+\s*\(/,
  /^\s*at\s/m,
];

export type GetErrorMessageOptions = {
  /** Mensagem usada quando o erro não traz nenhuma string utilizável. */
  fallback?: string;
  /** Mensagens específicas por status HTTP (ex.: 502 quando o backend hiberna). */
  statusMessages?: Record<number, string>;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function isSafeMessage(value: string): boolean {
  const text = value.trim();

  if (!text || text.length > MAX_MESSAGE_LENGTH) return false;
  if (/[\r\n]/.test(text)) return false;
  // JSON, HTML ou marcação: corpo cru de resposta, não mensagem de UI.
  if (/^[{[<]/.test(text)) return false;

  return !TECHNICAL_PATTERNS.some((pattern) => pattern.test(text));
}

function extractMessage(value: unknown, depth = 0): string | undefined {
  // Payloads reais têm no máximo dois níveis; o limite evita ciclos.
  if (depth > 3) return undefined;

  if (typeof value === "string") {
    return isSafeMessage(value) ? value.trim() : undefined;
  }

  const record = asRecord(value);
  if (!record) return undefined;

  // `error` e `message` são os campos usados pelo BFF e pelo RTK Query.
  for (const key of ["error", "message"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && isSafeMessage(candidate)) {
      return candidate.trim();
    }
  }

  // Campos aninhados: `{ data: { error } }`, `{ error: { message, code } }`.
  // O caso `{ message, code }` era o que quebrava o React ao virar filho.
  for (const key of ["data", "error", "message"]) {
    const nested = extractMessage(record[key], depth + 1);
    if (nested) return nested;
  }

  return undefined;
}

export function getErrorMessage(
  error: unknown,
  { fallback = DEFAULT_FALLBACK, statusMessages }: GetErrorMessageOptions = {},
): string {
  const status = asRecord(error)?.status;

  if (typeof status === "number" && statusMessages?.[status]) {
    return statusMessages[status];
  }

  if (status === "FETCH_ERROR" || status === "TIMEOUT_ERROR") {
    return NETWORK_MESSAGE;
  }

  return extractMessage(error) ?? fallback;
}
