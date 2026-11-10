export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin || origin === "null") return false;

  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const host = request.headers.get("host");
  if (host && parsed.host === host) return true;

  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return allowed.includes(parsed.origin);
}
