FROM node:22-alpine AS development
WORKDIR /app
COPY package*.json ./
COPY apps/bytebank-home/package.json ./apps/bytebank-home/
COPY apps/bytebank-app/package.json ./apps/bytebank-app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
RUN npm ci
COPY . .
EXPOSE 3001
ENV NEXT_PUBLIC_API_URL=http://backend:3000
CMD npm run dev --workspace=bytebank-app

FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/bytebank-home/package.json ./apps/bytebank-home/
COPY apps/bytebank-app/package.json ./apps/bytebank-app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
RUN npm ci
COPY . .
ENV NEXT_PUBLIC_API_URL=http://backend:3000
RUN npm run build --workspace=bytebank-app

FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/bytebank-app/package.json ./apps/bytebank-app/package.json
COPY --from=builder /app/apps/bytebank-app/.next ./apps/bytebank-app/.next
COPY --from=builder /app/apps/bytebank-app/public ./apps/bytebank-app/public
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3001
CMD npm run start --workspace=bytebank-app
