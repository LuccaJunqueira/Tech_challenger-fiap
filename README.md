# ByteBank

Internet banking fictício desenvolvido para o Tech Challenge da pós-graduação em Front-End Engineering (POSTECH/FIAP). Esta fase evolui a aplicação para **microfrontends** com Next.js Multizones, BFF, API real, Docker e deploy em cloud.

**Demo:** [bytebank-home-fiap.vercel.app](https://bytebank-home-fiap.vercel.app)

---

## Visão geral

O ByteBank é um internet banking fictício com duas zonas Next.js independentes: a **home** (rotas públicas) e o **app** (rotas autenticadas). A Fase 4 entrega:

- microfrontends com Next.js Multizones;
- BFF que concentra o acesso ao backend e mantém o JWT fora do navegador;
- Clean Architecture em `packages/core` (domínio e casos de uso puros) com adapters no app;
- performance: gráficos carregados sob demanda e menos prefetch;
- Docker Compose (dev e produção local), deploy na Vercel e no Render.

A entrada da demo é a home. As rotas autenticadas são servidas pelo app através dos rewrites da home.

### Funcionalidades

- Cadastro, login e sessão via cookie selado `HttpOnly`
- Dashboard com gráficos (evolução de saldo e distribuição por tipo) carregados sob demanda no cliente
- Transações: CRUD completo, filtros, busca e scroll infinito controlados pela URL
- Anexos por URL + descrição
- Sugestão de categoria por autocomplete do histórico + heurística (não persistida)
- Acessibilidade WCAG AA: teclado, leitores de tela e contraste validado

---

## Stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Redux Toolkit / RTK Query · Recharts · Storybook 10 · Jest · Docker Compose

---

## Arquitetura

```text
Navegador
   │  home (entrada) — porta 3000 em dev
   ├── /, /login, /register ......... bytebank-home
   └── /transactions/*, /api/* ...... rewrite → bytebank-app (porta 3001)
                                             │
                                             │ BFF (Route Handlers)
                                             │ cookie bytebank_session (HttpOnly)
                                             ▼
                                     guarda nginx (Render)
                                             │ header x-bff-secret
                                             ▼
                                     backend Node/Express + Mongo em memória
```

- **Multizones:** home (3000) e app (3001) são aplicações Next.js independentes. A home é a entrada; ela reescreve `/transactions/*` e `/api/*` para o app.
- **BFF:** os Route Handlers do app são a única porta para o backend. O navegador chama `/api/*` na origem da home; o BFF lê o cookie, chama o backend e devolve apenas o necessário.
- **Sessão:** o cookie `bytebank_session` é selado (`iron-session`), `HttpOnly`, `SameSite=Lax`, com TTL de 20 min. O JWT real do backend (12 h) fica dentro do cookie selado e nunca chega ao JavaScript.
- **Estado do servidor:** RTK Query é a fonte única. O `accountSlice` foi removido; não há cópia de transações em slice.
- **Clean Architecture:** `packages/core/src/domain` (entidades, ports e serviços puros) → `application/use-cases` → `apps/bytebank-app/src/infrastructure` (adapters HTTP) → apresentação (componentes e hooks). Sem over-engineering: só as fronteiras que o projeto usa.
- **RxJS:** fica na apresentação (`lib/search-pipeline.ts` e `hooks/useDebouncedSearch.ts`), nunca no domínio. `debounceTime` + `distinctUntilChanged` transformam a digitação em uma única atualização de URL.
- **Rota de demonstração do 404:** o item “Configurações” do menu aponta para uma rota sem página e usa o `not-found.tsx` customizado da home (404 intencional). O link não faz prefetch para não gerar 404 no DevTools.

---

## Decisões de arquitetura e segurança

| Tema | Decisão |
| --- | --- |
| Microfrontends | Next.js Multizones (Single SPA/Module Federation conflitam com App Router) |
| Fronteiras | Clean Architecture com ports/adapters em `packages/core`; repository + adapter |
| Sessão | BFF + cookie selado `bytebank_session`, `HttpOnly`, TTL 20 min |
| Token | JWT de 12 h só no servidor; o navegador nunca vê o token |
| Estado do servidor | RTK Query; `accountSlice` removido |
| RxJS | Só na apresentação (busca com debounce) |
| Testes | Jest para app/BFF; Storybook é catálogo visual, sem suíte Vitest |
| Backend imutável | BFF mascara cartão (só `last4`) e não devolve senha |
| Guarda | nginx bloqueia `GET /user` e `/docs` (404), exige `x-bff-secret` e roda non-root |
| Documentação | `docs/` não versionado; as decisões que o avaliador precisa estão neste README |

---

## Como rodar localmente

> **Para avaliar ou demonstrar, use o build de produção ou o compose de produção.** O `npm run dev` é só para desenvolvimento: em hosts com pouca RAM o Turbopack pode falhar ao persistir cache.

### Docker de desenvolvimento

Pré-requisitos: Docker e Docker Compose.

```bash
git clone <url-do-repositorio>
cd tech-challenger02
cp .env.example .env   # preencha SESSION_SECRET e BACKEND_PROXY_SECRET
docker compose up --build
```

Acesse **http://localhost:3000**. O backend sobe junto, exposto em `http://localhost:3002`.

Para parar: `docker compose down`.

### Sem Docker

Requisitos: Node.js 22+ e npm.

```bash
# Terminal 1 — backend
cd backend/tech-challenge-2
npm install
npm start

# Terminal 2 — home + app (na raiz)
npm ci
npm run dev
```

> `npm run dev` na raiz sobe **home e app**, não o backend. O backend precisa do Terminal 1 (ou de `npm run dev:backend`, que usa a porta 3002).

### Build de produção local (recomendado para avaliar)

É o mesmo comportamento do deploy, sem hot reload. Use este caminho para avaliar ou gravar o vídeo.

```bash
# Terminal 1 — backend
cd backend/tech-challenge-2
npm start

# Terminal 2 — build + start das duas zonas
npm ci
npm run build:home
npm run build:app
npm start
```

Acesse **http://localhost:3000**. Não rode `next dev` e `next start` ao mesmo tempo: os dois usam o mesmo `.next`.

### Produção local com Docker (recomendado para avaliar)

```bash
docker compose -f docker-compose.prod.yml up --build
```

- Home: http://localhost:3000
- App: http://localhost:3001

O compose de produção usa o mesmo `.env`. A URL interna do app (`NEXT_PUBLIC_APP_URL`) é passada como *build arg*: os rewrites da home são congelados no build e precisam apontar para o serviço `bytebank-app`.

### Storybook

```bash
npm ci
npm run storybook        # http://localhost:6006
npm run build-storybook  # build estático em storybook-static/
```

As stories ficam em `apps/bytebank-app` (3) e em `packages/ui` (3).

---

## Variáveis de ambiente

O `.env.example` (versionado) lista os nomes. As principais:

| Variável | Onde | Para quê |
| --- | --- | --- |
| `SESSION_SECRET` | app | assina o cookie de sessão (32+ caracteres) |
| `BACKEND_PROXY_SECRET` | app + guarda | header `x-bff-secret` entre BFF e guarda |
| `ALLOWED_ORIGINS` | app | origens exatas aceitas nas mutações do BFF |
| `INTERNAL_API_URL` | app | URL interna do backend/guarda |
| `NEXT_PUBLIC_APP_URL` | build da home | URL da zona app nos rewrites |
| `NEXT_PUBLIC_HOME_URL` | build do app | redirect absoluto para o login da home |
| `BACKEND_TIMEOUT_MS` | opcional | sobrescreve o timeout (default: 45 s em produção) |

A home não precisa de `SESSION_SECRET`: o BFF vive no app. Não existe `NEXT_PUBLIC_API_URL` nesta arquitetura — o navegador nunca fala com o backend. `MONGO_URI` também não é usada: o Mongo roda em memória.

---

## Scripts

```bash
npm run dev             # home + app (não sobe o backend)
npm run dev:home        # apenas a home (3000)
npm run dev:app         # apenas o app (3001)
npm run dev:backend     # backend na porta 3002
npm run lint            # ESLint + fronteiras de domínio
npm run lint:boundaries # regra de dependência entre camadas
npm run typecheck       # TypeScript em todos os workspaces
npm test                # Jest (app/BFF)
npm run test:coverage   # Jest com cobertura
npm run build:home      # build de produção da home
npm run build:app       # build de produção do app
npm start               # next start das duas zonas (após build)
npm run storybook       # Storybook em http://localhost:6006
npm run build-storybook # build estático do Storybook
```

---

## Testes e qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run build:home
npm run build:app
npm run build-storybook
```

O que é testado:

- domínio e casos de uso em `packages/core` (saldo, distribuição, sugestão de categoria);
- Route Handlers do BFF (login, register, account, transactions) e o helper de erro;
- hooks e pipeline RxJS da busca;
- serializers que mascaram cartão e removem dados sensíveis.

O que não é testado por Jest: componentes visuais além das stories do Storybook. Não há meta de 100% de cobertura; `npm run test:coverage` mostra o número atual. `npm run lint:boundaries` falha se o domínio importar apresentação ou infraestrutura.

O CI roda lint, typecheck, testes e builds nos dois workflows. O `security.yml` (push/PR) roda também `build-storybook`, `npm audit --omit=dev`, gitleaks e CodeQL; o `deploy.yml` (push para `main`) roda `build-storybook` antes do deploy.

---

## Deploy

- **Home e app:** Vercel, em dois projetos independentes. A home é a entrada:
  [bytebank-home-fiap.vercel.app](https://bytebank-home-fiap.vercel.app).
- **App:** [bytebank-app-steel.vercel.app](https://bytebank-app-steel.vercel.app), acessado pelos rewrites da home.
- **Backend:** Render (Docker), atrás da guarda nginx. A guarda é a única porta pública; o backend não é exposto.

Como o cookie funciona entre as zonas: a home reescreve `/api/*` para o app. O BFF grava o cookie `bytebank_session` na origem da home; nas requisições seguintes o navegador envia esse cookie, a home repassa ao app e o BFF o abre no servidor. O JWT nunca aparece no JavaScript.

Use a **URL da home** como entrada. Acessar o app diretamente não compartilha a sessão da home.

O Render (plano free) hiberna após inatividade: a primeira requisição pode levar 30–45 s e o banco em memória é zerado. Para avaliar, reaqueça e crie uma conta em `/register` na home; não há conta pronta.

---

## Evidências

- **Testes:** `npm test` → 25 suítes, 107 testes passando.
- **Cookie:** DevTools → Application → Cookies → `bytebank_session` com `HttpOnly` e `SameSite=Lax`. O login responde apenas `{ "authenticated": true }`; nenhum token vai para o navegador.
- **Mascaramento:** a resposta de `/api/account` traz `cards[].last4`, sem `number` e sem `cvc`.
- **Performance:** Lighthouse antes/depois na seção [Performance](#performance).
- **Storybook:** `npm run build-storybook` verde (6 stories em app + `packages/ui`).
- **Vídeo (≤ 5 min):** pendente de gravação.

---

## Performance

Em `/transactions`, os gráficos Recharts são carregados sob demanda (`next/dynamic` + `ssr: false`) com skeleton de altura fixa, e os links de edição não fazem prefetch. Medição em build de produção (Fast 4G, Lighthouse com n=1 por preset):

| Métrica | Antes | Depois |
| --- | --- | --- |
| JS da carga inicial | 296,4 kB | **199,6 kB (−33%)** |
| JS total | 296,4 kB | 309,2 kB (+4%) |
| TBT mobile | 260 ms | **170 ms** |
| Lighthouse mobile | 95 | **100** |
| LCP desktop | 1,3 s | **0,7 s** |
| CLS | 0 | 0 |
| Prefetch de edição | 4 | **0** |

O ganho real vem de tirar o chunk do Recharts do caminho crítico. Como os gráficos ficam acima da dobra, o `IntersectionObserver` e o prefetch no idle não têm efeito neste layout; o JS total sobe 4% porque o chunk passa a baixar depois do primeiro paint.

---

## Limitações conhecidas

- **Backend de terceiros:** a API fornecida não pode ser alterada. Por isso ela roda em `node:18-bullseye` (Node 18 e Debian 11 já em fim de vida) e recebe as vulnerabilidades herdadas da imagem base. O backend também mantém `GET /user` público e senhas em texto; a guarda bloqueia esse dump (404). Mitigação: o backend não é exposto diretamente; uma guarda nginx bloqueia rotas sensíveis, exige segredo do BFF e o container roda como usuário sem privilégios (uid 10001).
- **JWT herdado:** o backend de terceiros assina o token com um segredo fixo no código (`tech-challenge`). Como o backend é imutável, a proteção real é a guarda nginx + `BACKEND_PROXY_SECRET`; o token nunca chega ao navegador, pois fica dentro do cookie selado do BFF.
- **JWT e sessão:** o JWT real do backend dura 12 h, mas a sessão do BFF expira em 20 min.
- **Swagger:** `/docs` não é público; a guarda responde 404.
- **Upload de anexo** é feito por URL, não por arquivo binário (limitação da API).
- **Categoria de transação** é apenas sugerida no cliente; a API não possui o campo.
- **Cold start:** o Render (plano free) hiberna após inatividade. A primeira requisição pode levar 30–45 s. O BFF espera até 45 s e as telas de login/cadastro avisam que o servidor está acordando.
- **Banco em memória:** os dados são perdidos na hibernação; crie a conta novamente em `/register` após o cold start.
- **Hot reload:** em Next 16.4.5 + Turbopack no fluxo multizone, o `npm run dev` podia recarregar `/transactions` em loop sem arquivo mudar. Em 16.4.6 o loop não reproduziu (Turbopack e Webpack, direto e via home). O build de produção e o compose de produção não foram afetados. Se o loop voltar, use o build de produção ou o compose de produção; a causa raiz não foi confirmada.
- **RAM no desenvolvimento:** em hosts com ~2 GB, o `next dev` com Turbopack pode registrar `Out of memory` ao persistir cache. As rotas continuam respondendo, mas para avaliar use o build de produção ou o compose de produção.
- **Vulnerabilidades de desenvolvimento:** `npm audit --omit=dev` retorna **0**. O restante (moderado/baixo) está em ferramentas de build e teste (Jest, ESLint, Storybook/Vite) e não entra no runtime de produção. Atualizações *major* dessas ferramentas ficam para depois da entrega.
- **GitHub Actions:** alguns workflows ainda usam actions que rodam em Node 20 (depreciado). As atualizações estão abertas como PRs do Dependabot e devem ser mergeadas uma a uma, com CI verde.

---

## Próximos passos

- Rate limiting na guarda/proxy e comparação do segredo em tempo constante.
- CSP com nonce.
- Rate limiting no BFF.
- Testes E2E com Playwright.
- Observabilidade (logs estruturados e métricas).
- Validar o loop de Fast Refresh em 16.4.6; se voltar, usar `next dev --webpack` como plano B (só desenvolvimento; não bloqueia a entrega).
