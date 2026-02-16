#!/usr/bin/env sh
set -e

: "${BACKUP_CRON:=0 2 * * 0}"
: "${BACKUP_TMP_DIR:=/tmp}"

mkdir -p "$BACKUP_TMP_DIR"

echo "$BACKUP_CRON cd /app && pnpm exec tsx scripts/backup/backup.ts >> /var/log/backup.log 2>&1" > /etc/crontabs/root

echo "Backup cron installed: $BACKUP_CRON"

exec crond -f -l 8
