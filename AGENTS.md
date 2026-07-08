<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:redux-store -->
# Redux Store — ByteBank

## Store structure (`src/store/`)
- `index.ts` — `configureStore` with `auth`, `account`, `api` reducers + `apiSlice.middleware`
- `hooks.ts` — typed `useAppDispatch` and `useAppSelector`
- `authSlice.ts` — token, user, isAuthenticated; reducers `setCredentials`/`logout`; extraReducers for `login.*` matchers
- `accountSlice.ts` — accounts, transactions, cards, loading, error; extraReducers for `getAccount.*` matchers
- `apiSlice.ts` — RTK Query; endpoints `login`, `register`, `getAccount`, `createTransaction`, `getStatement`; `transformResponse` extracts `.result` from `ApiEnvelope<T>`; base query reads JWT from localStorage (SSR-safe with `typeof window` guard); 401 dispatches `{ type: 'auth/logout' }` (string action to avoid circular dep)
- `StoreProvider.tsx` — client wrapper `<Provider store={store}>`
- `RootState` = `ReturnType<typeof store.getState>` (never manual)
- `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`

## Key decisions
- **No circular deps**: `baseQueryWithReauth` dispatches string action `{ type: 'auth/logout' }` instead of importing `logout` action creator; `authSlice` and `accountSlice` import `apiSlice` for matchers (one-way dependency)
- **Transform**: All endpoints unwrap `ApiEnvelope.result` via `transformResponse`
- **Tag system**: `getAccount` provides `['Account']`; `createTransaction` invalidates `['Account', 'Transactions']`; `getStatement` provides `['Transactions']`
- **Context API untouched**: `TransactionsProvider` and mock data remain in place (migration is a separate step)
<!-- END:redux-store -->
