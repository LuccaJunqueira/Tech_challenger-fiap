import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "packages/core/src/domain",
  "packages/core/src/application",
];

// O core não pode conhecer framework, sessão, credencial nem UI.
// `next/headers`, `iron-session`, `@/lib/session` e `getSession()` são o
// caminho pelo qual a credencial vazaria para dentro do domínio (runbook 04b).
// `rxjs` é permitido só na presentation (runbook 05 / ADR-005).
const forbidden = [
  /from\s+["']next(\/|["'])/,
  /from\s+["']react(\/|["'])/,
  /from\s+["']@reduxjs\/toolkit/,
  /from\s+["']rxjs(\/|["'])/,
  /from\s+["']js-cookie/,
  /from\s+["']iron-session/,
  /from\s+["']@bytebank\/(types|ui)/,
  /from\s+["']@\//,
  /from\s+["']apps\//,
  /\brequire\s*\(\s*["'](next(\/|["'])|react(\/|["'])|@reduxjs\/toolkit|rxjs(\/|["'])|js-cookie|iron-session|@bytebank\/(types|ui)|@\/|apps\/)/,
  /\bimport\s*\(\s*["'](next(\/|["'])|react(\/|["'])|@reduxjs\/toolkit|rxjs(\/|["'])|js-cookie|iron-session|@bytebank\/(types|ui)|@\/|apps\/)/,
  /\bgetSession\s*\(/,
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const violations = [];

for (const root of roots) {
  for (const file of walk(root).filter((f) => f.endsWith(".ts"))) {
    const content = readFileSync(file, "utf8");
    for (const rule of forbidden) {
      if (rule.test(content)) violations.push(`${file}: ${rule}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Dependências proibidas no core:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("Core sem dependências de framework, sessão ou credencial.");
