// infra/backend-proxy/health.mjs
// Sidecar de health check: responde 200 só quando o backend (e o Mongo em
// memória) responde. O corpo de GET /user é descartado aqui e nunca chega ao
// nginx.
import { createServer } from "node:http";

const port = Number(process.env.HEALTH_PORT ?? 3002);
const backend = process.env.HEALTH_TARGET ?? "http://127.0.0.1:3001/user";

createServer(async (req, res) => {
  if (req.url !== "/health") {
    res.writeHead(404).end();
    return;
  }

  try {
    const response = await fetch(backend, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error(`backend ${response.status}`);
    res.writeHead(200, { "content-type": "application/json" });
    res.end('{"status":"ok"}');
  } catch {
    res.writeHead(503, { "content-type": "application/json" });
    res.end('{"status":"down"}');
  }
}).listen(port, "127.0.0.1");
