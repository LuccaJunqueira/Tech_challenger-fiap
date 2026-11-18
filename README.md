# ByteBank

Internet banking fictício do Tech Challenge (POSTECH/FIAP). A Fase 4 evolui o app da Fase 2 com Clean Architecture, BFF, testes, CI e deploy; multizones Next.js e API real já eram a base.

## Stack

- Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
- Redux Toolkit / RTK Query, RxJS, Recharts
- Jest, Storybook 10, Docker Compose

## Como acessar

### Pelo deploy (caminho principal)

https://bytebank-home-fiap.vercel.app

- No 1º acesso, aguarde o cold start de até ~45 s.
- Crie uma conta em `/register`: o banco é em memória e some ao hibernar.

### Localmente, com o compose de produção (caminho secundário)

```bash
git clone "https://github.com/LuccaJunqueira/Tech_challenger-fiap.git"
cd Tech_challenger-fiap
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # valor para SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # valor para BACKEND_PROXY_SECRET
docker compose -f docker-compose.prod.yml up --build
```

Use dois valores **diferentes** nos campos `SESSION_SECRET` e `BACKEND_PROXY_SECRET` do `.env`. Abra http://localhost:3000 e crie a conta em `/register`. O primeiro build demora alguns minutos.

| Variável | Finalidade |
| --- | --- |
| `SESSION_SECRET` | assina o cookie de sessão (32+ caracteres) |
| `BACKEND_PROXY_SECRET` | segredo do header `x-bff-secret` entre BFF e guarda |
| `ALLOWED_ORIGINS` | origens exatas aceitas nas mutações do BFF |
| `INTERNAL_API_URL` | URL interna do backend/guarda |
| `NEXT_PUBLIC_APP_URL` | URL da zona app nos rewrites da home |
| `NEXT_PUBLIC_HOME_URL` | redirect absoluto para o login da home |
| `BACKEND_TIMEOUT_MS` | opcional; timeout do BFF (padrão: 45 s em produção) |

Fora o `.env`, nada mais é necessário: `INTERNAL_API_URL` e `NEXT_PUBLIC_APP_URL` já vêm definidos no compose de produção.

> `npm run dev` e o compose de desenvolvimento são só para desenvolver: compilam sob demanda e consomem muita memória; em máquinas com pouca RAM podem ficar lentos ou falhar.

## Testes e qualidade

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --runInBand
npm run build-storybook
npm audit --omit=dev
```

Esperado: lint, typecheck e build limpos; **107 testes passando** (25 suítes); `npm audit --omit=dev` sem vulnerabilidades.

## Ganhos da Fase 4

- **Clean Architecture:** domínio e casos de uso puros em `packages/core`, adapters na infraestrutura do app.
- **Estado e cache:** RTK Query como fonte única do estado do servidor; sem `accountSlice`.
- **Programação reativa:** RxJS na busca, com `debounceTime` e `distinctUntilChanged` atualizando a URL.
- **Lazy loading e prefetch:** JS inicial de 296,4 → 199,6 kB (−33%), TBT mobile de 260 → 170 ms, Lighthouse mobile de 95 → 100, LCP desktop de 1,3 → 0,7 s e prefetch de 4 → 0; o JS total sobe 4% porque o chunk dos gráficos baixa depois do primeiro paint.
- **Segurança:** BFF como única porta para o backend, cookie selado `HttpOnly` e guarda nginx non-root. Sessão: 20 min (cookie selado); o JWT de 12 h do backend nunca sai do servidor.
- **Testes:** 107 testes cobrindo domínio, BFF, pipeline de busca e serializers.
- **CI:** lint, typecheck, testes, builds e Storybook nos workflows, além de `npm audit --omit=dev`, gitleaks e CodeQL.

## Limitações conhecidas

- Backend de terceiros (imutável): `GET /user` público, senhas em texto, JWT com segredo fixo e Node 18/Debian 11 fora de suporte; a guarda bloqueia as rotas sensíveis.
- Banco em memória e cold start do Render free (até ~45 s no 1º acesso).
- Categoria: não é salva pelo backend; a sugestão usa só as transações existentes.
- Datas: filtro por período personalizado ainda interpreta as datas em UTC; a data da transação não é editável.
- Anexo: apenas por URL https.
- Sem rate limit e sem CSP.
