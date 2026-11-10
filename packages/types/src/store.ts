import type { Account, AccountOverviewCard, Transaction, User } from './api';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AccountState {
  accounts: Account[];
  transactions: Transaction[];
  cards: AccountOverviewCard[];
  loading: boolean;
  error: string | null;
}
