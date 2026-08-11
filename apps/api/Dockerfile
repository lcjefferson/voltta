# syntax=docker/dockerfile:1

# Coolify:
#   Base Directory = apps/api
#   Port = 3001
#   Healthcheck Path = /health
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate exige DATABASE_URL (só no build; runtime usa a do Coolify)
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build?schema=public"
RUN npx prisma generate && npm run build && npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001
RUN apk add --no-cache libc6-compat openssl wget \
  && addgroup -S nodejs && adduser -S nestjs -G nodejs

# --chown no COPY evita chown -R lento em node_modules (timeout no Coolify)
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --chown=nestjs:nodejs --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nestjs
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=180s --retries=12 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
