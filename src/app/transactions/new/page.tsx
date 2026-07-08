"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Antes: addTransaction do Context API (dados mockados)
// Depois: useCreateTransactionMutation do RTK Query (API real)
import { useCreateTransactionMutation, useGetAccountQuery } from "@/store/apiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";

export default function NewTransactionPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Busca a primeira conta do usuário para obter accountId
  const { data: accountData } = useGetAccountQuery(undefined, {
    skip: !isAuthenticated,
  });
  const defaultAccountId = accountData?.account?.[0]?.id ?? "";

  // Antes: addTransaction do Context
  // Depois: mutation do RTK Query que chama POST /account/transaction
  const [createTransaction, { isLoading }] = useCreateTransactionMutation();

  const [form, setForm] = useState({
    type: "" as "Credit" | "Debit" | "",
    value: "",
    from: "",
    to: "",
    anexo: "",
    urlAnexo: "",
  });

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!form.type || !form.value || !defaultAccountId) return;

    try {
      await createTransaction({
        accountId: defaultAccountId,
        type: form.type as "Credit" | "Debit",
        value: parseFloat(form.value),
        from: form.type === "Credit" ? (form.from || undefined) : undefined,
        to: form.type === "Debit" ? (form.to || undefined) : undefined,
        anexo: form.anexo || undefined,
        urlAnexo: form.urlAnexo || undefined,
      }).unwrap();

      router.push("/transactions");
    } catch {
      // O erro é tratado pelo extraReducer do accountSlice ou permanece silencioso
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg w-full mx-auto">
      <h1 className="text-center text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Nova Transação</h1>

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo — antes: deposit/transfer/payment/withdrawal; depois: Credit/Debit */}
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

          {/* Antes: amount; depois: value (mesmo placeholder, mesmo visual) */}
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
              {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
            <Link href="/transactions" className="w-full sm:w-auto">
              <Button type="button" variant="secondary" className="w-full sm:w-auto">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
