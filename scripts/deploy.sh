#!/bin/bash
set -e

APP_DIR="${APP_DIR:-$HOME/app}"
cd "$APP_DIR"

echo "==> Pulling latest code..."
git pull origin main

echo "==> Installing dependencies..."
if command -v bun &> /dev/null; then
    bun install --frozen-lockfile
else
    npm ci
fi

echo "==> Building..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

# Copy static files to standalone (required for Next.js standalone)
echo "==> Copying static files..."
cp -r public .next/standalone/ 2>/dev/null || true
cp -r .next/static .next/standalone/.next/
cp -r .claude .next/standalone/ 2>/dev/null || true

echo "==> Restarting application..."
pm2 restart site --update-env || pm2 start ecosystem.config.js

echo "==> Verifying health..."
sleep 3
curl -sf http://localhost:3000/api/health && echo " OK" || echo " FAILED"

echo "==> Deploy complete"
