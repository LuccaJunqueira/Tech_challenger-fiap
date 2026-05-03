"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/context/transactions-context";
import type { TransactionType } from "@/data/transactions";

type FilterType = "all" | TransactionType;

const filterLabels: Record<FilterType, string> = {
  all: "Todos",
  deposit: "Depósito",
  transfer: "Transferência",
  payment: "Pagamento",
  withdrawal: "Saque",
};

const badgeVariant: Record<
  TransactionType,
  "green" | "cyan" | "purple" | "red"
> = {
  deposit: "green",
  transfer: "cyan",
  payment: "purple",
  withdrawal: "red",
};

const badgeLabel: Record<TransactionType, string> = {
  deposit: "↑ dep",
  transfer: "tra",
  payment: "pag",
  withdrawal: "↓ saque",
};

export default function TransactionsPage() {
  const { transactions, deleteTransaction, totals } = useTransactions();
  const [filter, setFilter] = useState<FilterType>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão geral</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href="/transactions/new">
          <Button variant="primary">+ Nova transação</Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Saldo disponível
          </p>
          <p
            className={`text-3xl font-mono font-bold ${totals.balance >= 0 ? "text-neon-cyan" : "text-neon-pink"}`}
          >
            R${" "}
            {totals.balance.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Entradas
          </p>
          <p className="text-3xl font-mono font-bold text-neon-green">
            R${" "}
            {totals.income.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {transactions.filter((t) => t.type === "deposit").length} transações
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Saídas
          </p>
          <p className="text-3xl font-mono font-bold text-neon-pink">
            R${" "}
            {totals.expense.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {
              transactions.filter(
                (t) => t.type === "payment" || t.type === "withdrawal",
              ).length
            }{" "}
            transações
          </p>
        </Card>
      </div>

      {/* Transações recentes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Transações recentes
          </h2>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Filtrar transações por tipo">
          {(
            ["all", "deposit", "transfer", "payment", "withdrawal"] as const
          ).map((type) => (
            <button
              key={type}
              role="tab"
              aria-selected={filter === type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-pill text-xs font-mono font-semibold transition-colors border ${
                filter === type
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                  : "text-muted-foreground border-white/10 hover:text-foreground"
              }`}
            >
              {filterLabels[type]}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {filtered.length === 0
            ? 'Nenhuma transação encontrada.'
            : `${filtered.length} transações encontradas.`
          }
        </div>

        <ul className="space-y-2" aria-label="Lista de transações">
          {filtered.length === 0 && (
            <li className="text-sm text-muted-foreground py-4 text-center">
              Nenhuma transação encontrada.
            </li>
          )}
          {filtered.map((t) => (
            <li
              key={t.id}
              className="
                flex flex-col sm:flex-row
                items-start sm:items-center
                justify-between
                gap-3 py-3
                border-b border-white/5 last:border-0
              "
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {t.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {t.date}
                    </span>
                    <Badge variant={badgeVariant[t.type]}>
                      {badgeLabel[t.type]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <p
                  className={`font-mono font-semibold text-sm ${
                    t.type === "deposit" ? "text-neon-green" : "text-neon-pink"
                  }`}
                >
                  {t.type === "deposit" ? "+" : "-"}R${" "}
                  {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <Link href={`/transactions/${t.id}/edit`}>
                  <Button variant="outline" size="sm" aria-label={`Editar ${t.description}`}>
                    Editar
                  </Button>
                </Link>
                {confirmDelete === t.id ? (
                  <span className="flex items-center gap-1" role="alert" aria-live="assertive">
                    <span className="sr-only">
                      Confirmar exclusão de {t.description}?
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteTransaction(t.id)}
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancelar
                    </Button>
                  </span>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConfirmDelete(t.id)}
                    aria-label={`Excluir ${t.description}`}
                  >
                    Excluir
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
