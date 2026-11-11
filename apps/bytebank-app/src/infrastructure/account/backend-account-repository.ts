import {
  type AccountRepository,
  type AccountSnapshot,
  BackendUnavailableError,
  UnauthorizedError,
} from "@bytebank/core";
import type { GetAccountResponse } from "@bytebank/types";

import type { CredentialProvider } from "@/infrastructure/auth/credential-provider";
import { fetchBackend } from "@/lib/backend-fetch";

import { mapAccountResponse } from "./backend-account-mapper";

export class BackendAccountRepository implements AccountRepository {
  constructor(private readonly credentials: CredentialProvider) {}

  async getOverview(): Promise<AccountSnapshot | null> {
    const token = await this.credentials.getToken();

    if (!token) {
      throw new UnauthorizedError();
    }

    let response: Response;

    try {
      response = await fetchBackend("/account", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new BackendUnavailableError();
    }

    if (response.status === 401) {
      throw new UnauthorizedError();
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new BackendUnavailableError();
    }

    const json = (await response
      .json()
      .catch(() => null)) as GetAccountResponse | null;

    if (!json) {
      throw new BackendUnavailableError();
    }

    return mapAccountResponse(json.result);
  }
}
