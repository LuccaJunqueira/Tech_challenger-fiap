import type { Transaction } from "./transaction";

export type Account = {
  id: string;
  type: string;
  userId: string;
};

export type BankCard = {
  id: string;
  accountId: string;
  type: string;
  isBlocked: boolean;
  last4: string;
  dueDate: string;
  functions: string;
  paymentDate: string;
  name: string;
};

export type AccountSnapshot = {
  account: Account | null;
  transactions: Transaction[];
  cards: BankCard[];
};
