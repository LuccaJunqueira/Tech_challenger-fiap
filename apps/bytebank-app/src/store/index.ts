import { combineReducers, configureStore } from "@reduxjs/toolkit";

import accountReducer from "./accountSlice";
import { apiSlice } from "./apiSlice";
import authReducer from "./authSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  account: accountReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
