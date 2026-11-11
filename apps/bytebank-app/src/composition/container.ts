import { GetAccountOverview } from "@bytebank/core";

import { BackendAccountRepository } from "@/infrastructure/account/backend-account-repository";
import { SessionCredentialProvider } from "@/infrastructure/auth/credential-provider";

export function makeGetAccountOverview(): GetAccountOverview {
  return new GetAccountOverview(
    new BackendAccountRepository(new SessionCredentialProvider()),
  );
}
