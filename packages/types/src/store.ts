import type { Account, BankCard, Transaction, User } from './api';

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AccountState {
  accounts: Account[];
  transactions: Transaction[];
  cards: BankCard[];
  loading: boolean;
  error: string | null;
}
