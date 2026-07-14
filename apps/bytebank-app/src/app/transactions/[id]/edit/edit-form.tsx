"use client";

import type { Transaction } from "@bytebank/types";
import { Button, Card, Input } from "@bytebank/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategorySuggestionField } from "@/app/transactions/category-suggestion-field";
import { AttachmentFields } from "@/components/AttachmentFields";
import { AriaLiveRegion } from "@/components/ui/AriaLiveRegion";
import { useUpdateTransactionMutation } from "@/store/apiSlice";

export function EditForm({
  transaction,
  transactionHistory = [],
}: {
  transaction: Transaction;
  transactionHistory?: string[];
}) {
  const router = useRouter();
  const [updateTransaction, { isLoading: isSaving }] =
    useUpdateTransactionMutation();

  const [form, setForm] = useState({
    type: transaction.type as "Credit" | "Debit" | "",
    value: transaction.value.toString(),
    from: transaction.from ?? "",
    to: transaction.to ?? "",
    anexo: transaction.anexo ?? "",
    urlAnexo: transaction.urlAnexo ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.type) newErrors.type = "Selecione o tipo da transação.";
    if (!form.value || parseFloat(form.value) <= 0)
      newErrors.value = "Informe um valor válido maior que zero.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!validate()) {
      setFeedbackMessage("Corrija os erros no formulário.");
      return;
    }

    try {
      await updateTransaction({
        id: transaction.id,
        data: {
          type: form.type as "Credit" | "Debit",
          value: parseFloat(form.value),
          from: form.type === "Credit" ? form.from || undefined : undefined,
          to: form.type === "Debit" ? form.to || undefined : undefined,
          anexo: form.anexo || undefined,
          urlAnexo: form.urlAnexo || undefined,
        },
      }).unwrap();

      setFeedbackMessage("Transação atualizada com sucesso!");
      router.push("/transactions");
    } catch {
      setFeedbackMessage("Erro ao atualizar transação. Tente novamente.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg w-full mx-auto">
      <AriaLiveRegion message={feedbackMessage} id="transaction-feedback" />

      <h1 className="text-center text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
        Editar Transação
      </h1>

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="type"
              className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Tipo
            </label>
            <select
              id="type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as "Credit" | "Debit" })
              }
              required
              aria-invalid={errors.type ? "true" : undefined}
              aria-describedby={errors.type ? "type-error" : undefined}
              className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
            >
              <option value="" className="bg-bg-surface">
                Selecione
              </option>
              <option value="Credit" className="bg-bg-surface">
                Entrada (Crédito)
              </option>
              <option value="Debit" className="bg-bg-surface">
                Saída (Débito)
              </option>
            </select>
            {errors.type && (
              <p id="type-error" className="text-destructive text-xs" role="alert" aria-live="polite">
                {errors.type}
              </p>
            )}
          </div>

          <Input
            label="Valor (R$)"
            id="value"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            required
            error={errors.value}
          />

          {form.type === "Credit" && (
            <CategorySuggestionField
              label="De (opcional)"
              id="from"
              value={form.from}
              onChange={(v) => setForm({ ...form, from: v })}
              history={transactionHistory}
            />
          )}

          {form.type === "Debit" && (
            <CategorySuggestionField
              label="Para (opcional)"
              id="to"
              value={form.to}
              onChange={(v) => setForm({ ...form, to: v })}
              history={transactionHistory}
            />
          )}

          <AttachmentFields
            anexo={form.anexo}
            urlAnexo={form.urlAnexo}
            onChange={(field, value) => setForm({ ...form, [field]: value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Data
            </label>
            <p className="text-foreground text-sm">
              {new Date(transaction.date).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {errors.form && (
            <p className="text-destructive text-xs" role="alert" aria-live="assertive">
              {errors.form}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Link href="/transactions">
              <Button variant="secondary">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
