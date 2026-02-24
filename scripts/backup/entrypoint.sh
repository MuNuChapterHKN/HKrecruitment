#!/bin/bash
set -euo pipefail

BACKUP_CRON="${BACKUP_CRON:-0 2 * * *}"
BACKUP_D="${BACKUP_D:-/etc/backup.d}"

# Ensure backup.d scripts are executable
chmod +x "$BACKUP_D"/*.sh 2>/dev/null || true

# Write crontab
mkdir -p /etc/crontabs
echo "${BACKUP_CRON} /usr/local/bin/run.sh >> /var/log/backup.log 2>&1" > /etc/crontabs/root

echo "[entrypoint] Backup cron scheduled: ${BACKUP_CRON}"
echo "[entrypoint] Scripts directory: ${BACKUP_D}"

# Optionally run once on startup
if [ "${BACKUP_ON_START:-false}" = "true" ]; then
    echo "[entrypoint] Running initial backup on start..."
    /usr/local/bin/run.sh
fi

echo "[entrypoint] Starting crond..."
exec crond -f -d 8
