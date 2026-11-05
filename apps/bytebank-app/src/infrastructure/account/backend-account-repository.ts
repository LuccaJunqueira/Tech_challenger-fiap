import type { AccountRepository, AccountSnapshot } from "@bytebank/core";
import type { GetAccountResponse } from "@bytebank/types";

import { mapAccountResponse } from "./backend-account-mapper";

export class BackendAccountRepository implements AccountRepository {
  async getOverview(token: string): Promise<AccountSnapshot | null> {
    const api = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

    if (!api) {
      throw new Error("INTERNAL_API_URL/NEXT_PUBLIC_API_URL não configurada");
    }

    const response = await fetch(`${api}/account`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const json = (await response.json()) as GetAccountResponse;
    return mapAccountResponse(json.result);
  }
}
