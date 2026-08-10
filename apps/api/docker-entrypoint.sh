#!/bin/sh
set -e

echo "[voltta-api] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[voltta-api] Starting NestJS on port ${API_PORT:-${PORT:-3001}}..."
exec node dist/main.js
