import type { AccountSnapshot } from "../entities/account";

export interface AccountRepository {
  getOverview(token: string): Promise<AccountSnapshot | null>;
}
