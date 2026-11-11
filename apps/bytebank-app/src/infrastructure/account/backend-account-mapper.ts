import type {
  AccountSnapshot,
  BankCard,
  Transaction,
} from "@bytebank/core";
import type { GetAccountResult } from "@bytebank/types";

export function mapAccountResponse(dto: GetAccountResult): AccountSnapshot {
  const account = dto.account[0];

  return {
    account: account
      ? { id: account.id, type: account.type, userId: account.userId }
      : null,
    transactions: dto.transactions.map(mapTransaction),
    cards: dto.cards.map(mapCard),
  };
}

export function mapTransaction(
  t: GetAccountResult["transactions"][number],
): Transaction {
  return {
    id: t.id,
    accountId: t.accountId,
    type: t.type,
    value: t.value,
    from: t.from,
    to: t.to,
    attachmentName: t.anexo,
    attachmentUrl: t.urlAnexo,
    date: new Date(t.date),
  };
}

function mapCard(c: GetAccountResult["cards"][number]): BankCard {
  const digits = c.number.replace(/\D/g, "");

  return {
    id: c.id,
    accountId: c.accountId,
    type: c.type,
    isBlocked: c.is_blocked,
    last4: digits.slice(-4),
    dueDate: c.dueDate,
    functions: c.functions,
    paymentDate: c.paymentDate ?? "",
    name: c.name,
  };
}
