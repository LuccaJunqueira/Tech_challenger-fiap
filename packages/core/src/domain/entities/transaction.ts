export type TransactionType = "Credit" | "Debit";

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  value: number;
  from?: string;
  to?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  date: Date;
};
