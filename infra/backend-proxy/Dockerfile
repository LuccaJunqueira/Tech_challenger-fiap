# infra/backend-proxy/Dockerfile
# Contexto de build: raiz do repositório.
# Sobe o backend do fornecedor + nginx (guarda) no mesmo container.
FROM node:18-bullseye

# Debian 11 (bullseye) está EOL: o repositório de segurança não publica mais
# os pacotes referenciados pelo índice. Usamos o snapshot de 20/05/2025 (data
# da imagem base) e desativamos a checagem de validade, que expira em
# repositórios arquivados.
RUN sed -i \
      -e 's|^deb http://deb.debian.org/debian bullseye main$|deb http://snapshot.debian.org/archive/debian/20250520T000000Z bullseye main|' \
      -e 's|^deb http://deb.debian.org/debian bullseye-updates main$|deb http://snapshot.debian.org/archive/debian/20250520T000000Z bullseye-updates main|' \
      -e 's|^deb http://deb.debian.org/debian-security bullseye-security main$|deb http://snapshot.debian.org/archive/debian-security/20250520T000000Z bullseye-security main|' \
      /etc/apt/sources.list \
 && apt-get -o Acquire::Check-Valid-Until=false update \
 && apt-get install -y --no-install-recommends nginx gettext-base curl ca-certificates libcurl4 openssl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Cache do binário do mongodb-memory-server (evita download no cold start).
ENV MONGOMS_DOWNLOAD_DIR=/opt/mongodb-binaries
RUN mkdir -p /opt/mongodb-binaries

COPY backend/tech-challenge-2/package*.json ./
RUN npm ci --omit=dev

# Garante o binário no cache da imagem (falha cedo se o download não funcionar).
RUN node -e "require('mongodb-memory-server').MongoMemoryServer.create().then(s => s.stop()).catch(e => { console.error(e); process.exit(1); })"

COPY backend/tech-challenge-2/ ./

COPY infra/backend-proxy/health.mjs /opt/health.mjs
COPY infra/backend-proxy/nginx.conf.template /etc/nginx/templates/backend.conf.template
COPY infra/backend-proxy/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
 && rm -f /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
