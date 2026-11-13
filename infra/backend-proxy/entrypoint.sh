#!/bin/bash
set -euo pipefail

: "${PORT:?PORT não definido pelo provedor}"
: "${BACKEND_PROXY_SECRET:?BACKEND_PROXY_SECRET não definido}"

export NODE_ENV=production
export port="${BACKEND_PORT:-3001}"

cd /usr/src/app

echo "[entrypoint] subindo backend na porta ${port}"
node src/index.js &
BACKEND_PID=$!

cleanup() {
  kill "$BACKEND_PID" "${HEALTH_PID:-}" "${NGINX_PID:-}" 2>/dev/null || true
}
trap cleanup TERM INT

# Espera o backend (e o Mongo em memória) antes de abrir a porta pública.
echo "[entrypoint] aguardando backend..."
for _ in $(seq 1 90); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${port}/user"; then
    break
  fi
  sleep 2
done
curl -fsS -o /dev/null "http://127.0.0.1:${port}/user" || {
  echo "[entrypoint] backend não respondeu; abortando"
  exit 1
}

echo "[entrypoint] subindo health sidecar"
HEALTH_PORT="${HEALTH_PORT:-3002}" \
  HEALTH_TARGET="http://127.0.0.1:${port}/user" \
  node /opt/health.mjs &
HEALTH_PID=$!

echo "[entrypoint] abrindo a porta ${PORT}"
envsubst '${PORT} ${BACKEND_PROXY_SECRET}' \
  < /etc/nginx/templates/backend.conf.template \
  > /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;' &
NGINX_PID=$!

set +e
wait -n
STATUS=$?
cleanup
wait || true
exit "$STATUS"
