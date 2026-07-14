import http from "http";

const SERVER = "http://localhost:3001";
const HEALTH_URL = `${SERVER}/api/health`;
const WARMUP_URL = `${SERVER}/transactions`;

function healthCheck() {
  return new Promise((resolve) => {
    http
      .get(HEALTH_URL, { timeout: 5000 }, (res) => {
        resolve(res.statusCode === 200);
      })
      .on("error", () => resolve(false));
  });
}

function warmUp() {
  return new Promise((resolve) => {
    http
      .get(WARMUP_URL, () => resolve())
      .on("error", () => resolve());
  });
}

async function main() {
  for (let i = 0; i < 30; i++) {
    const ok = await healthCheck();
    if (ok) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  await warmUp();
}

main();
