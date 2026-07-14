"use client";

import type { GetAccountResult } from "@bytebank/types";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { apiSlice } from "./apiSlice";
import { type AppStore, makeStore, type RootState } from "./index";

export default function StoreProvider({
  preloadedState,
  initialAccountData,
  children,
}: {
  preloadedState?: Partial<RootState>;
  initialAccountData?: GetAccountResult;
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));

  useEffect(() => {
    if (initialAccountData) {
      store.dispatch(
        apiSlice.util.upsertQueryData(
          "getAccount",
          undefined,
          initialAccountData,
        ),
      );
    }
  }, [initialAccountData, store]);

  return <Provider store={store}>{children}</Provider>;
}
