#!/bin/sh
set -e

echo "Applying database migrations..."
node scripts/migrate.mjs

echo "Starting application..."
exec "$@"
