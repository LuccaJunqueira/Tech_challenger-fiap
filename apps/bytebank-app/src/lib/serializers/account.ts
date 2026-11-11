import type {
  AccountOverview,
  Transaction as CoreTransaction,
} from "@bytebank/core";
import type { AccountOverviewDto } from "@bytebank/types";

export type TransactionDto = AccountOverviewDto["transactions"][number];

export function toTransactionDto(
  transaction: CoreTransaction,
): TransactionDto {
  return {
    id: transaction.id,
    accountId: transaction.accountId,
    type: transaction.type,
    value: transaction.value,
    from: transaction.from,
    to: transaction.to,
    anexo: transaction.attachmentName,
    urlAnexo: transaction.attachmentUrl,
    date: transaction.date.toISOString(),
  };
}

export function toAccountOverviewDto(
  overview: AccountOverview,
): AccountOverviewDto {
  return {
    account: overview.account
      ? {
          id: overview.account.id,
          type: overview.account.type,
          userId: overview.account.userId,
        }
      : null,
    transactions: overview.transactions.map(toTransactionDto),
    cards: overview.cards.map((card) => ({
      id: card.id,
      accountId: card.accountId,
      type: card.type,
      isBlocked: card.isBlocked,
      last4: card.last4,
      dueDate: card.dueDate,
      functions: card.functions,
      paymentDate: card.paymentDate,
      name: card.name,
    })),
    summary: overview.summary,
    balanceHistory: overview.balanceHistory,
    distribution: overview.distribution,
  };
}
