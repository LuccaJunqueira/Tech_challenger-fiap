import type { Account, Card, Transaction, User } from './api';

export interface AuthState {
  token: string | null;
  // O login real (POST /user/auth) retorna apenas o token, sem dados do usuário.
  // O preenchimento de `user` dependerá de decodificar o JWT ou de uma chamada
  // futura — isso será decidido no state-redux.md. Não implementar aqui.
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AccountState {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  loading: boolean;
  error: string | null;
}

// ⚠️ NÃO defina RootState manualmente aqui.
// Em vez disso, derive da store:
//
//   // src/store/index.ts
//   export type RootState = ReturnType<typeof store.getState>
