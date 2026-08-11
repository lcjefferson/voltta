#!/bin/sh
set -e

echo "[voltta-api] Bootstrapping..."

# Monta DATABASE_URL a partir de variáveis discretas (evita quebra com senha especial)
if [ -z "${DATABASE_URL:-}" ] && [ -n "${POSTGRES_HOST:-}" ]; then
  DATABASE_URL=$(node -e "
    const u = process.env.POSTGRES_USER || 'voltta';
    const p = encodeURIComponent(process.env.POSTGRES_PASSWORD || '');
    const h = process.env.POSTGRES_HOST || 'postgres';
    const port = process.env.POSTGRES_PORT || '5432';
    const db = process.env.POSTGRES_DB || 'voltta';
    process.stdout.write('postgresql://' + u + ':' + p + '@' + h + ':' + port + '/' + db + '?schema=public');
  ")
  export DATABASE_URL
  echo "[voltta-api] DATABASE_URL assembled from POSTGRES_*"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[voltta-api] ERROR: DATABASE_URL is empty"
  exit 1
fi

echo "[voltta-api] DB target: host=${POSTGRES_HOST:-?} port=${POSTGRES_PORT:-5432} user=${POSTGRES_USER:-?} db=${POSTGRES_DB:-?}"

echo "[voltta-api] Waiting for database..."
i=0
until node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.\$queryRaw\`SELECT 1\`
    .then(() => p.\$disconnect())
    .then(() => process.exit(0))
    .catch(async (e) => {
      console.error('[voltta-api] DB error:', e.message);
      try { await p.\$disconnect(); } catch {}
      process.exit(1);
    });
"; do
  i=$((i + 1))
  if [ "$i" -ge 40 ]; then
    echo "[voltta-api] ERROR: database not reachable after 40 attempts"
    echo "[voltta-api] Check: same POSTGRES_PASSWORD as the volume was created with, and that api shares network with postgres."
    exit 1
  fi
  echo "[voltta-api] DB not ready yet ($i/40)..."
  sleep 3
done

echo "[voltta-api] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[voltta-api] Seeding roles..."
node prisma/seed.cjs

echo "[voltta-api] Starting NestJS on port ${API_PORT:-${PORT:-3001}}..."
# nest (nodenext) emite em dist/src/main.js
exec node dist/src/main.js
