import { z } from "zod";

export type TransactionInput = {
  type: "Credit" | "Debit";
  value: number;
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
};

export type TransactionParseResult =
  | { ok: true; data: TransactionInput }
  | { ok: false; error: string };

const MAX_TEXT = 120;
const MAX_ATTACHMENT = 255;
const MAX_URL = 2_048;
const MAX_VALUE = 1_000_000_000;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function optionalTextSchema(label: string, max: number) {
  return z
    .unknown()
    .transform((value, ctx) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }
      if (typeof value !== "string") {
        ctx.addIssue(`${label} inválido`);
        return z.NEVER;
      }
      const trimmed = value.trim();
      if (trimmed.length > max) {
        ctx.addIssue(`${label} muito longo`);
        return z.NEVER;
      }
      if (CONTROL_CHARS.test(trimmed)) {
        ctx.addIssue(`${label} inválido`);
        return z.NEVER;
      }
      return trimmed || undefined;
    })
    .optional();
}

const optionalUrlSchema = z
  .unknown()
  .transform((value, ctx) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (typeof value !== "string") {
      ctx.addIssue("URL do anexo inválida");
      return z.NEVER;
    }
    const trimmed = value.trim();
    if (trimmed.length > MAX_URL || CONTROL_CHARS.test(trimmed)) {
      ctx.addIssue("URL do anexo inválida");
      return z.NEVER;
    }

    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      ctx.addIssue("URL do anexo inválida");
      return z.NEVER;
    }

    if (url.protocol !== "https:") {
      ctx.addIssue("URL do anexo deve usar https://");
      return z.NEVER;
    }
    if (url.username || url.password) {
      ctx.addIssue("URL do anexo inválida");
      return z.NEVER;
    }

    return url.toString();
  })
  .optional();

const valueSchema = z
  .union([z.number(), z.string()], { error: "Valor inválido" })
  .transform((value) =>
    typeof value === "number"
      ? value
      : value.trim() !== ""
        ? Number(value)
        : Number.NaN,
  )
  .refine(
    (value) => Number.isFinite(value) && value > 0 && value <= MAX_VALUE,
    { error: "Valor inválido" },
  );

const transactionSchema = z.object({
  type: z.enum(["Credit", "Debit"], { error: "Tipo inválido" }),
  value: valueSchema,
  from: optionalTextSchema("Origem", MAX_TEXT),
  to: optionalTextSchema("Destino", MAX_TEXT),
  anexo: optionalTextSchema("Anexo", MAX_ATTACHMENT),
  urlAnexo: optionalUrlSchema,
});

export function parseTransactionInput(body: unknown): TransactionParseResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Corpo inválido" };
  }

  const parsed = transactionSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Corpo inválido",
    };
  }

  return { ok: true, data: parsed.data };
}

const OBJECT_ID = /^[a-f0-9]{24}$/;

export function isTransactionId(value: string): boolean {
  return OBJECT_ID.test(value);
}
