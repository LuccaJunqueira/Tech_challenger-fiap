"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

import { AuthRedirectListener } from "./auth-redirect-listener";
import { type AppStore, makeStore, type RootState } from "./index";

export default function StoreProvider({
  preloadedState,
  children,
}: {
  preloadedState?: Partial<RootState>;
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore(preloadedState));

  useEffect(() => {
    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  }, [store]);

  return (
    <Provider store={store}>
      <AuthRedirectListener />
      {children}
    </Provider>
  );
}
