# ADR-005 — Programação reativa com RxJS

- **Status:** aceito
- **Data:** 11/11/2026
- **Contexto:** runbook `docs/fase 4/runbooks/runbook-05-programacao-reativa.md`
- **Relacionado:** ADR-009 (estado e cache), ADR-010 (credencial), `extra-08`

## Contexto

A busca de `/transactions` usava `setTimeout`/`clearTimeout` manual dentro de
`useEffect`, com `isFirstRender` e `paramsString` nas dependências. O requisito
do PDF pede técnicas de programação reativa. O `rxjs` não estava instalado.

## Decisão

### RxJS só na presentation

- O pipeline vive em `apps/bytebank-app` (hook + `lib/search-pipeline.ts`).
- `rxjs` é proibido em `packages/core/src/domain` e `packages/core/src/application`.
  A regra é verificada por `scripts/check-domain-boundaries.mjs` (from,
  `require(...)` e `import(...)` dinâmico).

### Pipeline busca → URL

- `Subject<string>` → `debounceTime(300)` → `distinctUntilChanged()` →
  `router.replace(?q=...)`.
- **Sem `switchMap` de HTTP:** a busca é local e termina na URL; não há
  requisição para cancelar.
- `usePathname()` + `scroll: false`; a URL fica sem `?` quando não há params.
- O input sincroniza com a URL apenas em `popstate` (voltar/avançar). Nossas
  próprias navegações (`router.replace`) não disparam `popstate`, o que elimina
  a corrida entre digitar e a URL terminar de atualizar.

### Idle timeout adiado

- O cookie `bytebank_session` tem TTL **absoluto** de 20 min (`ttl: 20 * 60` em
  `lib/session.ts`). O `iron-session` só renova em `session.save()`
  (login/register); as requisições seguintes não renovam.
- Um idle de 20 min só é correto com **sessão deslizante** (renovação por
  atividade). Isso é uma decisão de segurança separada e **não** entra na 05.
- A expiração real continua coberta por `401` + `AuthRedirectListener` (04).
- O plano futuro, com RxJS, `try/finally`, `resetApiState` e redirect via
  `AuthRedirectListener`, está em
  `docs/fase 4/extra-08-idle-timeout-e-sessao-deslizante.md`.

## Consequências

- O debounce manual some; o pipeline é testável sem React e com `TestScheduler`.
- Uma dependência nova no app (`rxjs`), tree-shaken; impacto medido no 06.
- A sessão continua com expiração absoluta de 20 min. Se o requisito de
  “logout por inatividade” for obrigatório, abrir a decisão de sessão
  deslizante no `extra-08` antes de implementar.
