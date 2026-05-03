"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/context/transactions-context";
import type { TransactionType } from "@/data/transactions";

export default function NewTransactionPage() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [form, setForm] = useState({
    type: "" as TransactionType | "",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!form.type || !form.amount || !form.description || !form.category)
      return;

    addTransaction({
      type: form.type as TransactionType,
      amount: parseFloat(form.amount),
      description: form.description,
      category: form.category,
      date: form.date,
    });

    router.push("/transactions");
  };

  return (
    <div className="p-4 sm:p-6 max-w-lg w-full mx-auto">
      <h1 className="text-center text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">Nova Transação</h1>

      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
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
                setForm({ ...form, type: e.target.value as TransactionType })
              }
              required
              className="w-full px-4 py-3 rounded-[var(--radius-input)] bg-bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-neon-cyan/50 focus:ring-2 focus:ring-neon-cyan/30 transition-all"
            >
              <option value="" className="bg-bg-surface">
                Selecione
              </option>
              <option value="deposit" className="bg-bg-surface">
                Depósito
              </option>
              <option value="transfer" className="bg-bg-surface">
                Transferência
              </option>
              <option value="payment" className="bg-bg-surface">
                Pagamento
              </option>
              <option value="withdrawal" className="bg-bg-surface">
                Saque
              </option>
            </select>
          </div>

          <Input
            label="Valor (R$)"
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />

          <Input
            label="Descrição"
            id="description"
            type="text"
            placeholder="Ex: Salário mensal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />

          <Input
            label="Categoria"
            id="category"
            type="text"
            placeholder="Ex: Receita"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />

          <Input
            label="Data"
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" variant="primary" className="w-full sm:w-auto">
              Salvar
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
