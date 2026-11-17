<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:monorepo-multizones -->
# Monorepo — ByteBank Multizones

## Estrutura

```
tech-challenger02/
├── package.json              → Root monorepo (workspaces, orquestra as duas zonas)
├── apps/
│   ├── bytebank-home/        → Zona host (rotas públicas, porta 3000)
│   │   ├── src/app/          → /, /login, /register
│   │   ├── src/store/        → authSlice + apiSlice (login/register)
│   │   └── next.config.ts    → rewrites → bytebank-app
│   └── bytebank-app/         → Zona remota (rotas autenticadas, porta 3001)
│       ├── src/app/          → /transactions, /transactions/new, /transactions/[id]/edit, /api/*
│       ├── src/store/        → authSlice + apiSlice (RTK Query)
│       └── next.config.ts    → assetPrefix para produção
├── packages/
│   ├── core/                 → domínio + casos de uso (sem Next/React)
│   ├── types/                → tipos compartilhados
│   └── ui/                   → componentes visuais
├── backend/                  → API de terceiros (não alterar)
├── infra/backend-proxy/      → guarda nginx + backend embutido (build próprio)
└── docker-compose.yml        → home, app e backend
```

## Scripts

- `npm run dev` — inicia home + app (não sobe o backend)
- `npm run dev:backend` — sobe o backend na porta 3002
- `npm run dev:home` / `npm run dev:app` — apenas uma zona
- `npm run build:home` / `npm run build:app` — builds de produção
- `npm run lint` — ESLint + fronteiras de domínio
- `npm run typecheck` — TypeScript em todos os workspaces

## Comunicação entre zonas

- Sessão via cookie selado `bytebank_session` (`iron-session`, HttpOnly, SameSite=Lax, TTL 20 min). O JWT real do backend fica dentro do cookie e nunca chega ao JavaScript.
- A home (host) faz proxy de `/transactions/*` e `/transactions-static/*` para o app via rewrites.
- Em dev: home (3000) → app (3001).
- Em produção: `assetPrefix` do app deve corresponder ao rewrite path.

## Regras

- Store Redux é independente em cada zona (não compartilhada).
- O BFF (`apps/bytebank-app/src/app/api/*`) é a única porta para o backend.
- `backend/` NÃO deve ser modificado.
<!-- END:monorepo-multizones -->

<!-- BEGIN:redux-store -->
# Redux Store — bytebank-app

## Store structure (`apps/bytebank-app/src/store/`)

- `index.ts` — `configureStore` com `auth` + `api` + `apiSlice.middleware`; `RootState` derivado do reducer.
- `hooks.ts` — `useAppDispatch` e `useAppSelector` tipados.
- `authSlice.ts` — `isAuthenticated`, `setAuthenticated`, `logout`, `selectIsAuthenticated`. Não guarda token.
- `apiSlice.ts` — RTK Query com `baseUrl: "/api"`; endpoints `getAccount`, `createTransaction`, `updateTransaction`, `deleteTransaction`. Em 401, `baseQueryWithReauth` despacha `{ type: "auth/logout" }` (string, para evitar dependência circular) e `api/resetApiState`.
- `selectors.ts` — `selectAccountOverview`, `selectTransactions`, `selectTransactionHistory`.
- `serverSnapshot.ts` — semeia o cache de `getAccount` no servidor para o `preloadedState`.
- `StoreProvider.tsx` — client wrapper `<Provider store={store}>`.

## Key decisions

- **Sem token no cliente:** a credencial fica no cookie selado; o navegador só chama `/api/*` na mesma origem.
- **Sem `accountSlice`:** RTK Query é a fonte única do estado do servidor.
- **Sem dependência circular:** o 401 usa a action por string `{ type: "auth/logout" }`.
- **Cache privado:** rotas de transação e `/api/*` respondem com `Cache-Control: private, no-store`.
<!-- END:redux-store -->
