export function getBackendUrl(): string {
  const url = process.env.INTERNAL_API_URL;

  if (!url) {
    throw new Error("INTERNAL_API_URL não configurada");
  }

  return url.replace(/\/+$/, "");
}
