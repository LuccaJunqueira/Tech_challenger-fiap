"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useDeleteTransactionMutation,
  useGetAccountQuery,
} from "@/store/apiSlice";
import { selectIsAuthenticated } from "@/store/authSlice";
import { useAppSelector } from "@/store/hooks";
import type { Transaction } from "@/types/api";

type FilterType = "all" | Transaction["type"];

const filterLabels: Record<FilterType, string> = {
  all: "Todos",
  Credit: "Entrada",
  Debit: "Saída",
};

const badgeVariant: Record<Transaction["type"], "green" | "red"> = {
  Credit: "green",
  Debit: "red",
};

const badgeLabel: Record<Transaction["type"], string> = {
  Credit: "↑ cr",
  Debit: "↓ db",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export default function TransactionsPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { data, isLoading, isError } = useGetAccountQuery(undefined, {
    skip: !isAuthenticated,
  });

  const transactions = useMemo(() => data?.transactions ?? [], [data]);

  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteTransaction, { isLoading: isDeleting }] =
    useDeleteTransactionMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "Credit")
      .reduce((acc, t) => acc + t.value, 0);
    const expense = transactions
      .filter((t) => t.type === "Debit")
      .reduce((acc, t) => acc + t.value, 0);
    return { income, expense, balance: income + expense };
  }, [transactions]);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-neon-pink">
          Erro ao carregar transações. Verifique sua conexão com o backend.
        </p>
      </div>
    );
  }

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

      {/* KPIs — estrutura visual idêntica, agora com dados da API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Saldo disponível
          </p>
          <p
            className={`text-3xl font-mono font-bold ${totals.balance >= 0 ? "text-neon-cyan" : "text-neon-pink"}`}
          >
            R$ {formatCurrency(totals.balance)}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Entradas
          </p>
          <p className="text-3xl font-mono font-bold text-neon-green">
            R$ {formatCurrency(totals.income)}
          </p>
          <p className="text-xs text-muted-foreground">
            {transactions.filter((t) => t.type === "Credit").length} transações
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
            Saídas
          </p>
          <p className="text-3xl font-mono font-bold text-neon-pink">
            R$ {formatCurrency(Math.abs(totals.expense))}
          </p>
          <p className="text-xs text-muted-foreground">
            {transactions.filter((t) => t.type === "Debit").length} transações
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

        {/* Filtros — antes: 4 tipos + all; depois: Credit/Debit + all */}
        <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Filtrar transações por tipo">
          {(["all", "Credit", "Debit"] as const).map((type) => (
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
                  {/* Antes: t.description. Depois: usa from/to/accountId como fallback */}
                  <p className="text-sm font-medium text-foreground truncate">
                    {t.from ?? t.to ?? `Conta ${t.accountId.slice(-4)}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
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
                    t.type === "Credit" ? "text-neon-green" : "text-neon-pink"
                  }`}
                >
                  {t.type === "Credit" ? "+" : "-"}R$ {formatCurrency(t.value)}
                </p>
                <Link href={`/transactions/${t.id}/edit`}>
                  <Button type="button" variant="secondary" className="text-xs px-2 py-1">
                    Editar
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs px-2 py-1 text-neon-pink"
                  onClick={() => setDeleteTarget(t.id)}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-bg-surface border border-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-foreground text-sm">
              Tem certeza que deseja excluir esta transação?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-neon-pink text-black"
                disabled={isDeleting}
                onClick={async () => {
                  await deleteTransaction(deleteTarget);
                  setDeleteTarget(null);
                }}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
