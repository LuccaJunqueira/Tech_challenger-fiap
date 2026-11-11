# ADR-009 — Estado e cache da Fase 4

- **Status:** aceito
- **Data:** 10/11/2026
- **Contexto:** runbook `docs/fase 4/runbooks/runbook-04-estado-e-cache.md`

## Decisão

### D4-1 = A — a lista continua no servidor

`/transactions` permanece um Server Component: busca com `getAccountOverview()`,
filtra com `filterTransactions` do `@bytebank/core` e renderiza KPIs, gráficos e
lista no servidor. O cache do RTK Query serve apenas os Client Components que
consomem `useGetAccountQuery` (hoje, o formulário de nova transação).

Consequências:

- `router.push("/transactions")` depois de criar/editar e `router.refresh()`
  depois de excluir continuam sendo a forma de atualizar a lista.
- A etapa 4.6 (atualização otimista) não é aplicada: otimizar um cache que a
  lista não lê teria efeito visível nulo.
- A opção B (lista lendo o cache) fica registrada como evolução futura; se for
  adotada, a 4.6 passa a ser obrigatória.

### D4-2 = Snapshot — hidratação com `preloadedState` e `await`

O layout RSC aguarda `buildAccountPreloadedState(dto)` e entrega o snapshot
serializável ao `StoreProvider`. A store do cliente nasce hidratada, então o
primeiro render (inclusive o HTML do SSR) já contém o dado e o `<datalist>` de
sugestões do formulário.

Não usar `useEffect` para popular o cache (HTML "carregando" + fetch duplicado)
nem `upsertQueryData` sem `await` dentro de inicializador (grava em microtask e
o primeiro render vê `isLoading`).

### D4-3 = Listener central — `AuthRedirectListener`

O `StoreProvider` monta um listener que observa `isAuthenticated`. Quando o
`baseQueryWithReauth` recebe 401 e despacha `auth/logout` + `resetApiState`, o
listener faz `window.location.replace("/login")` de qualquer página de
`/transactions`. O guard local do `new/page.tsx` é removido.

`window.location.replace` (full reload) é necessário porque `/login` pertence à
zona `bytebank-home`; o roteador da app zone não conhece essa rota.

### Local dos ADRs

ADRs ficam em `adr/` na raiz do repositório, versionável, sem alterar a regra
que mantém `docs/` fora do Git.

## Sinal do Débito

O backend inverte o sinal no POST (`saveTransaction.js`) e no PUT
(`updateTransaction.js`): Débito é persistido negativo nas duas vias. O
formulário envia valor positivo (`min="0.01"`). O formulário de edição passa a
pré-preencher com `Math.abs(transaction.value)` para não exigir correção manual
do sinal.

## Consequências

- Uma única tag (`Account`) no `apiSlice`; mutations invalidam essa tag.
- Sem `retry` na base query: o backend não é idempotente e um retry de
  POST/PUT/DELETE poderia duplicar transações.
- Sem `credentials: "include"` (mesma origem já envia o cookie de sessão).
- Sem `staleTime` (não existe no RTK Query); se necessário, usar
  `refetchOnMountOrArgChange` em segundos.
- `Cache-Control: private, no-store` declarado em `next.config.ts` para
  `/transactions`, `/transactions/:path*` e `/api/:path*`.
- Logout e 401 limpam o cache do RTK Query.
