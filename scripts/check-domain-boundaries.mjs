import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = [
  "packages/core/src/domain",
  "packages/core/src/application",
];

const forbidden = [
  /from\s+["']next(\/|["'])/,
  /from\s+["']react(\/|["'])/,
  /from\s+["']@reduxjs\/toolkit/,
  /from\s+["']js-cookie/,
  /from\s+["']@bytebank\/(types|ui)/,
  /from\s+["']@\//,
  /from\s+["']apps\//,
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

console.log("Core sem dependências de framework.");
