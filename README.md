# ByteBank

Internet banking fictício — Tech Challenge da pós-graduação em Front-End Engineering, POSTECH/FIAP. Evolução da aplicação da Fase 1 para arquitetura de microfrontends, com API real, Docker e deploy em cloud.

---

## Arquitetura

Duas zonas independentes via **Next.js Multizones** (aprovado pelo professor da disciplina, dado que Single SPA e Module Federation têm conflitos conhecidos com o App Router):

- **bytebank-home** (porta 3000) — rotas públicas: `/`, `/login`, `/register`
- **bytebank-app** (porta 3001) — rotas autenticadas: `/transactions`

`bytebank-home` faz proxy das rotas autenticadas para `bytebank-app`. A sessão é compartilhada via cookie JWT `httpOnly`.

---

## Stack

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Redux Toolkit / RTK Query · Recharts · Storybook 10 · Docker Compose

---

## Como rodar

**Pré-requisito:** Docker e Docker Compose

```bash
git clone <url-do-repositorio>
cd tech-challenger01
docker-compose up
```

Acesse **http://localhost:3000** — tudo funciona a partir daí (backend sobe junto, na porta 3002).

Para parar: `docker-compose down`

## Produção (Docker)

O projeto possui um `docker-compose.prod.yml` separado para simular o ambiente de produção localmente (build otimizado, sem hot reload, servido via `next start`):

\`\`\`bash
docker compose -f docker-compose.prod.yml up --build
\`\`\`

- `bytebank-home`: http://localhost:3000
- `bytebank-app`: http://localhost:3001

**Sem Docker:**
```bash
# Terminal 1
cd backend/tech-challenge-2 && npm install && port=3002 npm start

# Terminal 2
npm install && npm run dev
```

**Storybook:** `npm run storybook` → http://localhost:6006

---

## Funcionalidades

- Cadastro, login e sessão via JWT
- Dashboard com gráficos (evolução de saldo, distribuição por tipo) — SSR
- Transações: CRUD completo, filtros, busca e scroll infinito, tudo via URL (server-driven)
- Anexos por URL + descrição (a API fornecida não aceita upload binário)
- Sugestão automática de categoria de transação: autocomplete baseado no histórico real da conta + heurística por palavra-chave (sem persistência — a API fornecida não tem campo de categoria)
- Acessibilidade WCAG AA — teclado, leitores de tela, contraste validado

Documentação técnica detalhada de cada decisão em `docs/`.

---

## Deploy

Demonstração do requisito de cloud: https://bytebank-home-fiap.vercel.app
**Backend roda só localmente** — use Docker para testar funcionalidades de verdade.

---

## Limitações conhecidas

- Upload de anexo é via URL, não arquivo binário (limitação da API fornecida)
- Categorização de transações é sugerida via heurística client-side, exibida como dica visual — não persiste no backend (API não tem campo de categoria)