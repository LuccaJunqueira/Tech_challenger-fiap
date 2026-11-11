# ADR-010 — Credencial de leitura × escrita e contrato de erros

- **Status:** aceito
- **Data:** 10/11/2026
- **Contexto:** runbook `docs/fase 4/runbooks/runbook-04b-port-sem-token-erros-tipados.md`
- **Relacionado:** ADR-009 (estado e cache)

## Contexto

O 04b removeu o token do port/use case de leitura e passou a resolver a
credencial na infraestrutura. As mutações (`POST`/`PUT`/`DELETE` de
`/api/transactions`) continuam lendo `session.backendToken` diretamente no BFF,
porque precisam repassar o `Authorization: Bearer` ao backend. Isso cria **duas
rotas de credencial** no código.

## Decisão

### Leitura (`GET /account`)

- `AccountRepository.getOverview()` e `GetAccountOverview.execute()` não recebem
  credencial.
- `BackendAccountRepository` recebe um `CredentialProvider` injetado pelo
  container; `SessionCredentialProvider` é a única implementação que fala com
  `getSession()`.
- A credencial ausente ou rejeitada vira `UnauthorizedError`; indisponibilidade
  vira `BackendUnavailableError`; 404 vira `null`.

### Escrita (`/api/transactions` e `/api/transactions/[id]`)

- O BFF continua lendo `session.backendToken` diretamente para montar o header
  `Authorization` da mutação.
- O pré-check de sessão (401 antes de qualquer trabalho) é mantido como
  *defense in depth*: valida origem, valida payload e só então chama o backend.
- Os erros tipados do `getAccountOverview()` usado para descobrir `accountId` e
  ownership são traduzidos por `toErrorResponse` (401 × 502).

### Duas rotas de credencial são intencionais agora

Unificar exigiria um cliente HTTP autenticado (ex.: `AuthenticatedBackendClient`)
que resolvesse a credencial via provider e aplicasse o header em todas as
chamadas. Isso é possível, mas:

- o ganho é principalmente didático (uma única porta de credencial);
- o custo é médio (novo componente, testes e refatoração das três mutações);
- a 05 tem foco em RxJS e idle logout, não em refatorar o BFF.

**Recomendação:** não unificar na 05. Reavaliar na 06/07 se houver tempo e se o
número de chamadas autenticadas crescer. Até lá, a divergência fica registrada
aqui e coberta por testes (401 em leitura e escrita).

## Contrato de erros

Os erros do core carregam um discriminante estável além da classe:

```ts
export class UnauthorizedError extends Error {
  readonly code = "UNAUTHORIZED" as const;
  // ...
}

export class BackendUnavailableError extends Error {
  readonly code = "BACKEND_UNAVAILABLE" as const;
  // ...
}
```

Guards `isUnauthorizedError` / `isBackendUnavailableError` checam `instanceof`
primeiro e caem no `code` depois. Motivo: o `instanceof` funciona enquanto o
módulo é único no grafo do servidor (é o caso hoje — `npm ls @bytebank/core`
mostra uma cópia deduplicada), mas falha se o pacote for duplicado no bundle ou
se o erro atravessar uma fronteira de serialização. O `code` mantém o contrato
sem depender da identidade da classe.

## Invariante de fronteira

`npm run lint:boundaries` passa a proibir explicitamente, em
`packages/core/src/domain` e `packages/core/src/application`:

- `next` (inclui `next/headers`) e `react`;
- `iron-session`, `js-cookie`, `@reduxjs/toolkit`;
- `@bytebank/types`, `@bytebank/ui`, `@/...` e `apps/...`;
- `require(...)` e `import(...)` desses módulos;
- qualquer chamada `getSession(...)`.

Assim a regra “o core não conhece sessão/credencial” deixa de ser disciplina e
vira falha de lint.

## Consequências

- A leitura tem 401 × 502 distinguíveis e o RSC decide redirect × tela de erro.
- A escrita mantém o comportamento anterior (401 cedo; `mapBackendError` para o
  restante) e não regride.
- Se a sessão expirar entre o pré-check e a chamada, o backend responde 401 e o
  BFF devolve 401 — consistente com a leitura.
- A unificação futura é possível sem quebrar o core: basta o client autenticado
  implementar `CredentialProvider` e ser injetado no container.
