import type { AccountOverviewDto } from "@bytebank/types";

import { apiSlice } from "./apiSlice";
import { makeStore,type RootState } from "./index";

/**
 * Constrói o preloadedState (serializável) com o cache do getAccount semeado.
 * Roda no servidor (layout RSC), com await — nunca dentro de um inicializador.
 */
export async function buildAccountPreloadedState(
  initialAccountData: AccountOverviewDto,
): Promise<Partial<RootState>> {
  const seed = makeStore();

  await seed.dispatch(
    apiSlice.util.upsertQueryData("getAccount", undefined, initialAccountData),
  );

  // O preloadedState de um slice SUBSTITUI o initialState inteiro (não faz
  // merge), então as 5 chaves do slice `api` precisam estar presentes.
  // `mutations` e `subscriptions` zerados: do servidor só interessa o cache de
  // queries (subscriptions guardam callbacks — não são serializáveis).
  const { queries, provided, config } = seed.getState().api;

  return {
    api: {
      queries,
      mutations: {},
      provided,
      subscriptions: {},
      config,
    },
  };
}
