import type { AccountSnapshot } from "../entities/account";
import type { Transaction } from "../entities/transaction";

export type TransactionFilters = {
  type?: string;
  period?: string;
  min?: number;
  max?: number;
  query?: string;
  startDate?: string;
  endDate?: string;
};

export type AccountOverview = AccountSnapshot & {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  balanceHistory: { date: string; balance: number }[];
  distribution: { name: string; value: number }[];
};

export function buildAccountOverview(
  snapshot: AccountSnapshot,
  now = new Date(),
): AccountOverview {
  const transactions = [...snapshot.transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const totalIncome = transactions
    .filter((t) => t.type === "Credit")
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Debit")
    .reduce((acc, t) => acc + t.value, 0);

  const balanceHistory = transactions.reduce<
    { date: string; balance: number }[]
  >((acc, t) => {
    const previous = acc.at(-1)?.balance ?? 0;
    acc.push({ date: t.date.toISOString(), balance: previous + t.value });
    return acc;
  }, []);

  return {
    ...snapshot,
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome + totalExpense,
    },
    balanceHistory,
    distribution: [
      { name: "Entradas", value: totalIncome },
      { name: "Saídas", value: Math.abs(totalExpense) },
    ],
  };
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
  now = new Date(),
): Transaction[] {
  const {
    type,
    period,
    min,
    max,
    query,
    startDate,
    endDate,
  } = filters;

  return transactions.filter((t) => {
    if (type && type !== "all" && t.type !== type) return false;
    if (min !== undefined && t.value < min) return false;
    if (max !== undefined && t.value > max) return false;

    if (query) {
      const needle = query.toLowerCase();
      const haystack = `${t.from ?? ""} ${t.to ?? ""}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (period && period !== "all") {
      const diffDays =
        (now.getTime() - t.date.getTime()) / (1000 * 60 * 60 * 24);

      if (period === "7d" && diffDays > 7) return false;
      if (period === "30d" && diffDays > 30) return false;
      if (period === "3m" && diffDays > 90) return false;

      if (period === "custom") {
        if (startDate && t.date < new Date(startDate)) return false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (t.date > end) return false;
        }
      }
    }

    return true;
  });
}
