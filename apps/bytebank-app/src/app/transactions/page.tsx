import type { Transaction } from "@bytebank/types";
import { Button, Card } from "@bytebank/ui";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BalanceLineChart } from "@/components/charts/BalanceLineChart";
import { TransactionDistributionChart } from "@/components/charts/TransactionDistributionChart";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { getServerAccount } from "@/lib/getServerAccount";
import { JWT_COOKIE_NAME } from "@/store/constants";

import { DeleteButton } from "./delete-button";
import { SearchBar } from "./search-bar";
import { TransactionFilters } from "./transaction-filters";
import { TransactionList } from "./transaction-list";

const filterLabels: Record<string, string> = {
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

function getHighlightedText(text: string, query?: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? (
        <mark key={i} className="bg-neon-cyan/30 rounded px-0.5">
          {part}
        </mark>
      )
      : part,
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    period?: string;
    min?: string;
    max?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const { type, period, min, max, q, startDate, endDate } = await searchParams;
  const filter = (type ?? "all") as string;

  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const accountData = await getServerAccount(token);

  if (!accountData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-neon-pink">
          Erro ao carregar transações. Verifique sua conexão com o backend.
        </p>
      </div>
    );
  }

  const transactions = accountData.transactions;

  const totalIncome = transactions
    .filter((t) => t.type === "Credit")
    .reduce((acc, t) => acc + t.value, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "Debit")
    .reduce((acc, t) => acc + t.value, 0);
  const balance = totalIncome + totalExpense;

  const balanceHistory = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce<{ date: string; balance: number }[]>((acc, t) => {
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({ date: t.date, balance: lastBalance + t.value });
      return acc;
    }, []);

  const distributionData = [
    { name: "Entradas", value: totalIncome },
    { name: "Saídas", value: Math.abs(totalExpense) },
  ];

  const filtered = transactions.filter((t) => {
    if (type && type !== "all" && t.type !== type) return false;
    if (min && t.value < parseFloat(min)) return false;
    if (max && t.value > parseFloat(max)) return false;
    if (q && !t.from?.toLowerCase().includes(q.toLowerCase()) && !t.to?.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }
    if (period && period !== "all") {
      const txDate = new Date(t.date);
      const now = new Date();
      const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
      if (period === "7d" && diffDays > 7) return false;
      if (period === "30d" && diffDays > 30) return false;
      if (period === "3m" && diffDays > 90) return false;
      if (period === "custom") {
        if (startDate && txDate < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (txDate > end) return false;
        }
      }
    }
    return true;
  });

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
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

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          title="Saldo disponível"
          value={balance}
          variant={balance >= 0 ? "cyan" : "pink"}
        />
        <KpiCard
          title="Entradas"
          value={totalIncome}
          variant="green"
          subtitle={`${transactions.filter((t) => t.type === "Credit").length} transações`}
        />
        <KpiCard
          title="Saídas"
          value={Math.abs(totalExpense)}
          variant="pink"
          subtitle={`${transactions.filter((t) => t.type === "Debit").length} transações`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Evolução do saldo
          </h2>
          <BalanceLineChart data={balanceHistory} />
        </Card>
        <Card className="p-4">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Distribuição Crédito / Débito
          </h2>
          <TransactionDistributionChart data={distributionData} />
        </Card>
      </div>

      {/* Transações recentes */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Transações recentes
          </h2>
        </div>

        {/* Search */}
        <div className="mb-4 max-w-xs">
          <SearchBar />
        </div>

        {/* Filtros via URL */}
        <div
          className="flex gap-2 mb-4 flex-wrap"
          role="tablist"
          aria-label="Filtrar transações por tipo"
        >
          {(["all", "Credit", "Debit"] as const).map((t) => (
            <Link
              key={t}
              href={t === "all" ? "/transactions" : `/transactions?type=${t}`}
              role="tab"
              aria-selected={filter === t}
              className={`px-3 py-1.5 rounded-pill text-xs font-mono font-semibold transition-colors border ${
                filter === t
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                  : "text-muted-foreground border-white/10 hover:text-foreground"
              }`}
            >
              {filterLabels[t]}
            </Link>
          ))}
        </div>

        {/* Advanced filters */}
        <div className="mb-4">
          <TransactionFilters />
        </div>

        {/* Screen reader live region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {filtered.length === 0
            ? "Nenhuma transação encontrada."
            : `${filtered.length} transações encontradas.`}
        </div>

          {/* Transaction List with infinite scroll */}
          <TransactionList
            key={filtered.map((t) => t.id).join(",")}
          >
          {filtered.map((t) => (
            <li
              key={t.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getHighlightedText(
                      t.from ?? t.to ?? `Conta ${t.accountId.slice(-4)}`,
                      q,
                    )}
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
                  {t.type === "Credit" ? "+" : "-"}R${" "}
                  {formatCurrency(t.value)}
                </p>
                <Link href={`/transactions/${t.id}/edit`} aria-label={`Editar transação de ${t.from ?? t.to ?? "Conta " + t.accountId.slice(-4)}`}>
                  <Button variant="secondary" size="sm">
                    Editar
                  </Button>
                </Link>
                <DeleteButton transactionId={t.id} transactionLabel={t.from ?? t.to ?? `Conta ${t.accountId.slice(-4)}`} />
              </div>
            </li>
          ))}
        </TransactionList>
      </Card>
    </div>
  );
}
