// Estes tipos representam o body cru retornado pela API (com envelope).
// A extração de `result` e o transformResponse serão implementados no
// apiSlice.ts durante o state-redux.md — não implementar aqui.

export type ApiEnvelope<T> = {
  message: string;
  result: T;
};

// ─── User (frontend representation, stored in Redux) ──────────────────────────

export type User = {
  id: string;
  username: string;
  email: string;
};

// ─── POST /user ──────────────────────────────────────────────────────────────

export type CreateUserRequest = {
  username: string;
  email: string;
  password: string;
};

export type CreateUserResult = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type CreateUserResponse = ApiEnvelope<CreateUserResult>;

// ─── POST /user/auth ─────────────────────────────────────────────────────────

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
};

export type LoginResponse = ApiEnvelope<LoginResult>;

// ─── Account ──────────────────────────────────────────────────────────────────

export type Account = {
  id: string;
  type: string;
  userId: string;
};

// ─── Transaction ──────────────────────────────────────────────────────────────

// O backend devolve Transaction com estes campos (DetailedAccount DTO):
// id, accountId, type(Credit|Debit), value, from?, to?, date, anexo?, urlAnexo?
// NÃO existem: amount, description, category, createdAt
export type Transaction = {
  id: string;
  accountId: string;
  type: 'Credit' | 'Debit';
  value: number;
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
  date: string;
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export type Card = {
  id: string;
  accountId: string;
  type: string;
  is_blocked: boolean;
  number: string;
  dueDate: string;
  functions: string;
  cvc: string;
  paymentDate: string;
  name: string;
};

// ─── GET /account ─────────────────────────────────────────────────────────────

export type GetAccountResult = {
  account: Account[];
  transactions: Transaction[];
  cards: Card[];
};

export type GetAccountResponse = ApiEnvelope<GetAccountResult>;

// ─── POST /account/transaction ────────────────────────────────────────────────

export type CreateTransactionRequest = {
  accountId: string;
  type: 'Credit' | 'Debit';
  value: number;
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
};

export type CreateTransactionResult = Transaction;

export type CreateTransactionResponse = ApiEnvelope<CreateTransactionResult>;

// ─── PUT /account/transaction/:id ─────────────────────────────────────────────

export type UpdateTransactionRequest = {
  value?: number;
  type?: 'Credit' | 'Debit';
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
};

export type UpdateTransactionResult = Transaction;

export type UpdateTransactionResponse = ApiEnvelope<UpdateTransactionResult>;

// ─── DELETE /account/transaction/:id ───────────────────────────────────────────

export type DeleteTransactionResult = void;

// ─── GET /account/:id/statement ───────────────────────────────────────────────

export type GetStatementResult = {
  transactions: Transaction[];
};

export type GetStatementResponse = ApiEnvelope<GetStatementResult>;
