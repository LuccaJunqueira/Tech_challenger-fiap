"use client";

import { Button, Card, Input } from "@bytebank/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { AttachmentFields } from "@/components/AttachmentFields";
import { AriaLiveRegion } from "@/components/ui/AriaLiveRegion";
import {
  useCreateTransactionMutation,
  useGetAccountQuery,
} from "@/store/apiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

export default function NewTransactionPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.replace("/login");
    }
  }, [isAuthenticated]);

  const { data: accountData } = useGetAccountQuery(undefined, {
    skip: !isAuthenticated,
  });
  const defaultAccountId = accountData?.account?.[0]?.id ?? "";

  const [createTransaction, { isLoading }] = useCreateTransactionMutation();

  const [form, setForm] = useState({
    type: "" as "Credit" | "Debit" | "",
    value: "",
    from: "",
    to: "",
    anexo: "",
    urlAnexo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.type) newErrors.type = "Selecione o tipo da transação.";
    if (!form.value || parseFloat(form.value) <= 0)
      newErrors.value = "Informe um valor válido maior que zero.";
    if (!defaultAccountId)
      newErrors.form = "Nenhuma conta disponível. Verifique sua conexão.";
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
      await createTransaction({
        accountId: defaultAccountId,
        type: form.type as "Credit" | "Debit",
        value: parseFloat(form.value),
        from: form.type === "Credit" ? form.from || undefined : undefined,
        to: form.type === "Debit" ? form.to || undefined : undefined,
        anexo: form.anexo || undefined,
        urlAnexo: form.urlAnexo || undefined,
      }).unwrap();

      setFeedbackMessage("Transação criada com sucesso!");
      router.push("/transactions");
    } catch {
      setFeedbackMessage("Erro ao criar transação. Tente novamente.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg w-full mx-auto">
      <AriaLiveRegion message={feedbackMessage} id="transaction-feedback" />

      <h1 className="text-center text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
        Nova Transação
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
            <Input
              label="De (opcional)"
              id="from"
              type="text"
              placeholder="Ex: Salário, Cliente X"
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />
          )}

          {form.type === "Debit" && (
            <Input
              label="Para (opcional)"
              id="to"
              type="text"
              placeholder="Destinatário"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
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
              {isClient ? new Date().toLocaleDateString("pt-BR") : <>&nbsp;</>}
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
              disabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
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
