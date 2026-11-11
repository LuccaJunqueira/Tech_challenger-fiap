import type { AccountRepository } from "../../domain/ports/account-repository";
import {
  buildAccountOverview,
  type AccountOverview,
} from "../../domain/services/account-overview";

export class GetAccountOverview {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(): Promise<AccountOverview | null> {
    const snapshot = await this.accounts.getOverview();
    return snapshot ? buildAccountOverview(snapshot) : null;
  }
}
