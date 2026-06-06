#!/bin/sh
set -e

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ ! -d vendor ]; then
  composer install
fi

if [ -f artisan ] && [ -z "$APP_KEY" ] && ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force
fi

exec "$@"
