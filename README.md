# ByteBank 

O ByteBank é uma aplicação fictícia de internet banking criada para o Tech Challenge da pós-graduação em Front-End Engineering da POSTECH/FIAP.

---

## Funcionalidades

- Página inicial com apresentação do produto
- Dashboard com saldo, entradas e saídas
- Listagem de transações com filtros por tipo
- Criação, edição e exclusão de transações
- Documentação de componentes via Storybook

---

## Tecnologias

| Tecnologia | Versão |
|---|---|
| Next.js | 16.2.3 |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Storybook | 10.3 |

---

## Como rodar

**Pré-requisitos:** Node.js 20.x ou superior

**1. Instale as dependências**

```bash
npm install
```

**2. Rode a aplicação**

```bash
npm run dev
```

Acesse: http://localhost:3000

**3. Rode o Storybook**

```bash
npm run storybook
```

Acesse: http://localhost:6006

---

## Observações

- Os dados são mockados via Context API com `useState`, sem integração com back-end.
- Os componentes de interface são desenvolvidos internamente e documentados no Storybook.