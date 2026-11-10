import type { AccountRepository, AccountSnapshot } from "@bytebank/core";
import type { GetAccountResponse } from "@bytebank/types";

import { fetchBackend } from "@/lib/backend-fetch";

import { mapAccountResponse } from "./backend-account-mapper";

export class BackendAccountRepository implements AccountRepository {
  async getOverview(token: string): Promise<AccountSnapshot | null> {
    const response = await fetchBackend("/account", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as GetAccountResponse;
    return mapAccountResponse(json.result);
  }
}
