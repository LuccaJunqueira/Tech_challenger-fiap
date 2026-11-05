import { GetAccountOverview } from "@bytebank/core";

import { BackendAccountRepository } from "@/infrastructure/account/backend-account-repository";

export function makeGetAccountOverview(): GetAccountOverview {
  return new GetAccountOverview(new BackendAccountRepository());
}
