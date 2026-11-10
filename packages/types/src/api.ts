// Envelope padrão da API — todas as responses têm { message, result }
export type ApiEnvelope<T> = {
  message: string;
  result: T;
};

// ─── User ────────────────────────────────────────────────────────────────────
export type User = {
  id: string;
  username: string;
  email: string;
};

// ─── POST /user ───────────────────────────────────────────────────────────────
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

// ─── POST /user/auth ──────────────────────────────────────────────────────────
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
};

export type LoginResponse = ApiEnvelope<LoginResult>;

// ─── Respostas do BFF (sem token) ─────────────────────────────────────────────
export type BffLoginResult = {
  authenticated: boolean;
};

export type BffRegisterResult = {
  user: User;
};

// ─── Account ──────────────────────────────────────────────────────────────────
export type Account = {
  id: string;
  type: string;
  userId: string;
};

// ─── Transaction ──────────────────────────────────────────────────────────────
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

// ─── Card (renomeado para BankCard para evitar colisão com o componente Card de @bytebank/ui) ─────
export type BankCard = {
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
  cards: BankCard[];
};

export type GetAccountResponse = ApiEnvelope<GetAccountResult>;

// ─── DTO seguro do BFF (sem number/cvc) ──────────────────────────────────────
export type AccountOverviewCard = {
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

export type AccountOverviewDto = {
  account: Account | null;
  transactions: Transaction[];
  cards: AccountOverviewCard[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
  };
  balanceHistory: { date: string; balance: number }[];
  distribution: { name: string; value: number }[];
};

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
