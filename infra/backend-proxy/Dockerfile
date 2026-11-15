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

# Roda como usuário sem privilégios. O nginx (porta 8080) e o mongod em memória
# precisam escrever em diretórios que, na imagem base, pertencem ao root:
# - /etc/nginx/conf.d: o entrypoint renderiza o template com envsubst;
# - /var/cache/nginx, /var/lib/nginx, /var/log/nginx e /run: pid, logs e temp;
# - /opt/mongodb-binaries e /usr/src/app: cache do Mongo e código do backend.
# Não use USER nginx: o worker precisa dos mesmos diretórios e o master não
# teria permissão de setuid.
# O usuário é criado antes dos COPY para usar --chown e evitar que o chown -R
# duplique node_modules e o binário do Mongo em uma camada extra (~280 MB).
RUN mkdir -p /usr/src/app /opt/mongodb-binaries /home/app \
      /var/cache/nginx /var/lib/nginx /var/log/nginx /run \
 && groupadd --system --gid 10001 app \
 && useradd --system --uid 10001 --gid app --home-dir /home/app app \
 && chown -R app:app \
      /usr/src/app \
      /opt/mongodb-binaries \
      /etc/nginx/conf.d \
      /var/cache/nginx \
      /var/lib/nginx \
      /var/log/nginx \
      /run \
      /home/app

ENV HOME=/home/app
USER app

WORKDIR /usr/src/app

# Cache do binário do mongodb-memory-server (evita download no cold start).
ENV MONGOMS_DOWNLOAD_DIR=/opt/mongodb-binaries

COPY --chown=app:app backend/tech-challenge-2/package*.json ./
RUN npm ci --omit=dev

# Garante o binário no cache da imagem (falha cedo se o download não funcionar).
RUN node -e "require('mongodb-memory-server').MongoMemoryServer.create().then(s => s.stop()).catch(e => { console.error(e); process.exit(1); })"

COPY --chown=app:app backend/tech-challenge-2/ ./

COPY --chown=app:app infra/backend-proxy/health.mjs /opt/health.mjs
COPY --chown=app:app infra/backend-proxy/nginx.conf.template /etc/nginx/templates/backend.conf.template
COPY --chown=app:app infra/backend-proxy/entrypoint.sh /usr/local/bin/entrypoint.sh

# Normaliza CRLF -> LF. O Git guarda estes arquivos com LF, mas em checkouts
# Windows (core.autocrlf=true) o working tree fica CRLF e o shebang quebra
# ("exec ... no such file or directory"). O Render builda do Git (LF), mas o
# build local precisa funcionar igual.
# sed -i cria o temporário no diretório do arquivo; /usr/local/bin é do root e
# não é gravável pelo usuário app. Por isso normalizamos via /tmp e sobrescrevemos
# o conteúdo do arquivo (o app é dono dele).
RUN for f in \
      /usr/local/bin/entrypoint.sh \
      /opt/health.mjs \
      /etc/nginx/templates/backend.conf.template; do \
      sed 's/\r$//' "$f" > /tmp/normalized && cat /tmp/normalized > "$f"; \
    done \
 && chmod +x /usr/local/bin/entrypoint.sh \
 && rm -f /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
