"use client";

import type { Transaction } from "@bytebank/types";
import { Button, Card, Input } from "@bytebank/ui";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useGetAccountQuery,
  useUpdateTransactionMutation,
} from "@/store/apiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { data, isLoading } = useGetAccountQuery(undefined, {
    skip: !isAuthenticated,
  });
  const transactions = data?.transactions ?? [];
  const transaction = transactions.find((t: Transaction) => t.id === id);

  const [updateTransaction, { isLoading: isSaving }] =
    useUpdateTransactionMutation();

  const [form, setForm] = useState({
    type: (transaction?.type ?? "") as "Credit" | "Debit" | "",
    value: transaction?.value.toString() ?? "",
    from: transaction?.from ?? "",
    to: transaction?.to ?? "",
    anexo: transaction?.anexo ?? "",
    urlAnexo: transaction?.urlAnexo ?? "",
    date:
      transaction?.date?.split("T")[0] ??
      new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.replace("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Transação não encontrada.</p>
        <Link
          href="/transactions"
          className="text-neon-cyan text-sm hover:underline mt-2 inline-block"
        >
          Voltar
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!form.type || !form.value) return;

    try {
      await updateTransaction({
        id,
        data: {
          type: form.type as "Credit" | "Debit",
          value: parseFloat(form.value),
          from: form.type === "Credit" ? (form.from || undefined) : undefined,
          to: form.type === "Debit" ? (form.to || undefined) : undefined,
          anexo: form.anexo || undefined,
          urlAnexo: form.urlAnexo || undefined,
        },
      }).unwrap();

      router.push("/transactions");
    } catch {
      // erro tratado pelo RTK Query
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg w-full mx-auto">
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
          />

          {form.type === "Credit" && (
            <Input
              label="De (opcional)"
              id="from"
              type="text"
              placeholder="Remetente"
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

          <Input
            label="Anexo (opcional)"
            id="anexo"
            type="text"
            placeholder="Descrição do anexo"
            value={form.anexo}
            onChange={(e) => setForm({ ...form, anexo: e.target.value })}
          />

          <Input
            label="URL do Anexo (opcional)"
            id="urlAnexo"
            type="url"
            placeholder="https://..."
            value={form.urlAnexo}
            onChange={(e) => setForm({ ...form, urlAnexo: e.target.value })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Data
            </label>
            <p className="text-foreground text-sm">
              {new Date(transaction.date).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Link href="/transactions"><Button variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
