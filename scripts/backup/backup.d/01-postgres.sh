#!/bin/bash
# Dumps each configured database using pg_dump (custom format, max compression).
# Keeps the last BACKUP_RETENTION_DAYS days worth of backups (default: 7).

set -euo pipefail

BACKUP_BASE="${BACKUP_DIR:-/backups}"
TIMESTAMP="$(date -u '+%Y%m%d_%H%M%S')"
BACKUP_PATH="${BACKUP_BASE}/postgres/${TIMESTAMP}"

PGHOST="${POSTGRES_HOST:-postgres}"
PGPORT="${POSTGRES_PORT:-5432}"
PGUSER="${POSTGRES_USER}"
export PGPASSWORD="${POSTGRES_PASSWORD}"

# Space-separated list of databases to back up — override via BACKUP_DATABASES env var
DATABASES="${BACKUP_DATABASES:-${POSTGRES_DB} ${DB_HKR_DATABASE} ${DB_N8N_DATABASE}}"

echo "Backup destination: $BACKUP_PATH"
mkdir -p "$BACKUP_PATH"

FAILED=0
for db in $DATABASES; do
    echo "  -> dumping: $db"
    if pg_dump \
        --host="$PGHOST" \
        --port="$PGPORT" \
        --username="$PGUSER" \
        --dbname="$db" \
        --format=custom \
        --compress=9 \
        --file="$BACKUP_PATH/${db}.dump"; then
        echo "     OK: ${db}.dump ($(du -sh "$BACKUP_PATH/${db}.dump" | cut -f1))"
    else
        echo "     FAILED: $db"
        FAILED=$((FAILED + 1))
    fi
done

# Retention cleanup
RETENTION="${BACKUP_RETENTION_DAYS:-7}"
echo "Removing backups older than ${RETENTION} days..."
find "${BACKUP_BASE}/postgres" -maxdepth 1 -mindepth 1 \
    -type d -name '[0-9]*' \
    -mtime +"${RETENTION}" \
    -exec rm -rf {} + 2>/dev/null || true

echo "PostgreSQL backup complete (${FAILED} database(s) failed)"
exit "$FAILED"
