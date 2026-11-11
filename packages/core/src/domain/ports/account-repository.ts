import type { AccountSnapshot } from "../entities/account";

export interface AccountRepository {
  /**
   * A credencial é resolvida pela infraestrutura (CredentialProvider).
   * O core não conhece cookie nem qualquer mecanismo de autenticação.
   */
  getOverview(): Promise<AccountSnapshot | null>;
}
