<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:monorepo-multizones -->
# Monorepo — ByteBank Multizones

## Estrutura

```
tech-challenger01/
├── package.json              ← Root monorepo (workspaces, orchestrates both apps)
├── apps/
│   ├── bytebank-home/        ← Zona host (rotas públicas, porta 3000)
│   │   ├── src/app/          ← /, /login, /register
│   │   ├── src/store/        ← authSlice + apiSlice (login/register only)
│   │   └── next.config.ts    ← rewrites → bytebank-app
│   └── bytebank-app/         ← Zona remota (rotas autenticadas, porta 3001)
│       ├── src/app/          ← /transactions, /transactions/new, /transactions/[id]/edit
│       ├── src/store/        ← authSlice + accountSlice + apiSlice (completo)
│       └── next.config.ts    ← assetPrefix para produção
├── backend/                  ← API (tech-challenge-2)
├── docs/                     ← Documentação
└── docker-compose.yml        ← 3 serviços: bytebank-home, bytebank-app, backend
```

## Scripts

- `npm run dev` — Inicia ambas as zonas + backend em paralelo (via concurrently)
- `npm run dev:home` — Apenas bytebank-home (porta 3000)
- `npm run dev:app` — Apenas bytebank-app (porta 3001)
- `npm run build:home` — Build produção bytebank-home
- `npm run build:app` — Build produção bytebank-app
- `npm run lint` — Lint em todos os workspaces

## Comunicação entre zonas

- Autenticação via cookie JWT (`jwt_token`) — mesmo cookie utilizado por ambas as zonas
- bytebank-home (host) faz proxy de `/transactions/*` para bytebank-app via rewrites
- Em dev: bytebank-home (3000) → bytebank-app (3001)
- Em produção: assetPrefix do bytebank-app deve corresponder ao rewrite path

## Regras

- Store Redux é independente em cada zona (não compartilhada)
- Tipos e componentes são duplicados por zona (cada app é autossuficiente)
- Backend NÃO deve ser modificado
<!-- END:monorepo-multizones -->

<!-- BEGIN:redux-store -->
# Redux Store — bytebank-app

## Store structure (`apps/bytebank-app/src/store/`)
- `index.ts` — `configureStore` with `auth`, `account`, `api` reducers + `apiSlice.middleware`
- `hooks.ts` — typed `useAppDispatch` and `useAppSelector`
- `authSlice.ts` — token, user, isAuthenticated; reducers `setCredentials`/`logout`; extraReducers for `login.*` matchers; usa js-cookie (não localStorage)
- `accountSlice.ts` — accounts, transactions, cards, loading, error; extraReducers for `getAccount.*` matchers
- `apiSlice.ts` — RTK Query; endpoints `login`, `register`, `getAccount`, `createTransaction`, `getStatement`, `updateTransaction`, `deleteTransaction`; `transformResponse` extracts `.result` from `ApiEnvelope<T>`; base query lê JWT do cookie (js-cookie); 401 dispatches `{ type: 'auth/logout' }` (string action to avoid circular dep)
- `constants.ts` — `JWT_COOKIE_NAME` e `getJwtCookieOptions()`
- `StoreProvider.tsx` — client wrapper `<Provider store={store}>`
- `RootState` = `ReturnType<typeof store.getState>` (never manual)
- `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`

## Key decisions
- **No circular deps**: `baseQueryWithReauth` dispatches string action `{ type: 'auth/logout' }` instead of importing `logout` action creator; `authSlice` and `accountSlice` import `apiSlice` for matchers (one-way dependency)
- **Transform**: All endpoints unwrap `ApiEnvelope.result` via `transformResponse`
- **Tag system**: `getAccount` provides `['Account']`; `createTransaction` invalidates `['Account', 'Transactions']`; `getStatement` provides `['Transactions']`
- **Cookie auth**: JWT armazenado em cookie (`jwt_token`), não localStorage — necessário para SSR e Multizones
<!-- END:redux-store -->
