import type { GetAccountResponse, GetAccountResult } from "@bytebank/types";
import { cache } from "react";

export const getServerAccount = cache(async (token: string): Promise<GetAccountResult | null> => {
  const API =
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API}/account`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json: GetAccountResponse = await res.json();
  return json.result;
});
