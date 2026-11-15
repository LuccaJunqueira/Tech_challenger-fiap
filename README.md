# ByteBank

Internet banking fictício desenvolvido para o Tech Challenge da pós-graduação em Front-End Engineering (POSTECH/FIAP). Esta fase evolui a aplicação para **microfrontends** com Next.js Multizones, BFF, API real, Docker e deploy em cloud.

**Demo:** [bytebank-home-fiap.vercel.app](https://bytebank-home-fiap.vercel.app)

> Detalhes de arquitetura, decisões e histórico de desenvolvimento: [Contexto_da_Fase_04.md](./Contexto_da_Fase_04.md)

---

## Stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Redux Toolkit / RTK Query · Recharts · Storybook 10 · Jest · Docker Compose

---

## Como rodar

### Docker (recomendado)

Pré-requisitos: Docker e Docker Compose.

```bash
git clone <url-do-repositorio>
cd tech-challenger02
cp .env.example .env   # preencha SESSION_SECRET e BACKEND_PROXY_SECRET
docker compose up --build
```

Acesse **http://localhost:3000**. O backend sobe junto, exposto em `http://localhost:3002`.

Para parar: `docker compose down`.

### Produção local

Build otimizado (sem hot reload), servido com `next start`:

```bash
docker compose -f docker-compose.prod.yml up --build
```

- Home: http://localhost:3000
- App: http://localhost:3001

O compose de produção usa o mesmo `.env`. A URL interna do app (`NEXT_PUBLIC_APP_URL`) é passada como *build arg*: os rewrites da home são congelados no build e precisam apontar para o serviço `bytebank-app`.

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

### Storybook

```bash
npm ci
npm run storybook        # http://localhost:6006
npm run build-storybook  # build estático em storybook-static/
```

### Variáveis de ambiente

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

A home não precisa de `SESSION_SECRET`: o BFF vive no app.

---

## Funcionalidades

- Cadastro, login e sessão via JWT em cookie
- Dashboard com gráficos (evolução de saldo e distribuição por tipo) carregados sob demanda no cliente
- Transações: CRUD completo, filtros, busca e scroll infinito controlados pela URL
- Anexos por URL + descrição
- Sugestão de categoria por autocomplete do histórico + heurística (não persistida)
- Acessibilidade WCAG AA: teclado, leitores de tela e contraste validado

---

## Conta demo

| E-mail | Senha |
| --- | --- |
| `demo@bytebank.test` | `demo123456` |

A conta é **fictícia** e existe apenas para demonstração.

O banco do backend é **em memória**: a conta e as transações somem quando o Render hiberna. Para recriar:

```bash
HOME_URL=https://bytebank-home-fiap.vercel.app node scripts/seed-demo.mjs
```

---

## Arquitetura

Duas zonas independentes via **Next.js Multizones**:

- **bytebank-home** (porta 3000) — rotas públicas: `/`, `/login`, `/register`
- **bytebank-app** (porta 3001) — rotas autenticadas: `/transactions`

A home faz proxy das rotas autenticadas para o app. A sessão é compartilhada por cookie JWT. Cada zona tem seu próprio store Redux; tipos e componentes são autossuficientes por zona.

O **BFF** (Route Handlers do Next.js) conversa com o backend e nunca expõe o token ou o segredo da guarda ao navegador.

Rotas sem página (como o item “Configurações” do menu) usam o `not-found.tsx` customizado da home.

---

## Testes e qualidade

```bash
npm run lint         # ESLint + fronteiras de domínio
npm run typecheck    # TypeScript em todos os workspaces
npm test             # Jest (107 testes)
npm run build:home   # build de produção da home
npm run build:app    # build de produção do app
```

O CI (`.github/workflows/security.yml`) roda lint, typecheck, testes, builds, `npm audit --omit=dev`, gitleaks e CodeQL.

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

- **Backend de terceiros:** a API fornecida não pode ser alterada. Por isso ela roda em `node:18-bullseye` (Node 18 e Debian 11 já em fim de vida) e recebe as vulnerabilidades herdadas da imagem base. O backend também mantém `GET /user` público e senhas em texto; a guarda bloqueia esse dump. Mitigação: o backend não é exposto diretamente; uma guarda nginx bloqueia rotas sensíveis, exige segredo do BFF e o container roda como usuário sem privilégios (uid 10001).
- **Upload de anexo** é feito por URL, não por arquivo binário (limitação da API).
- **Categoria de transação** é apenas sugerida no cliente; a API não possui o campo.
- **Cold start:** o Render (plano free) hiberna após inatividade. A primeira requisição pode levar 30–45 s. O BFF espera até 45 s e as telas de login/cadastro avisam que o servidor está acordando.
- **Banco em memória:** os dados são perdidos na hibernação; use o seed para recriar a conta demo.
- **Hot reload:** o loop de Fast Refresh ocorre apenas em `npm run dev`; o build de produção e o Docker não são afetados. Para avaliar, use `docker compose up --build` ou `next start`.
- **Vulnerabilidades de desenvolvimento:** `npm audit --omit=dev` retorna **0**. O restante (moderado/baixo) está em ferramentas de build e teste (Jest, ESLint, Storybook/Vite) e não entra no runtime de produção. Atualizações *major* dessas ferramentas ficam para depois da entrega.
- **GitHub Actions:** alguns workflows ainda usam actions que rodam em Node 20 (depreciado). As atualizações estão abertas como PRs do Dependabot e devem ser mergeadas uma a uma, com CI verde.
