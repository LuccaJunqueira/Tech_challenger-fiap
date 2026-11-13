/**
 * URL da home para navegação entre zonas. Em produção o app é servido atrás do
 * rewrite da home; quando o domínio do app é acessado direto, `/login` não
 * existe ali, então o redirect precisa ser absoluto.
 */
export function homeUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_HOME_URL;

  if (!base) return path;

  return `${base.replace(/\/+$/, "")}${path}`;
}
