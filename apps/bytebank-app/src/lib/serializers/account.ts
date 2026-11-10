import type { AccountOverview } from "@bytebank/core";
import type { AccountOverviewDto } from "@bytebank/types";

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
    transactions: overview.transactions.map((transaction) => ({
      id: transaction.id,
      accountId: transaction.accountId,
      type: transaction.type,
      value: transaction.value,
      from: transaction.from,
      to: transaction.to,
      anexo: transaction.attachmentName,
      urlAnexo: transaction.attachmentUrl,
      date: transaction.date.toISOString(),
    })),
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
