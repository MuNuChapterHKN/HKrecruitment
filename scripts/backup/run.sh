#!/bin/bash
# Main runner: executes all *.sh scripts in BACKUP_D in alphabetical order.
# Each script is run independently — a failure in one does not stop the others.

BACKUP_D="${BACKUP_D:-/etc/backup.d}"
TIMESTAMP="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
FAILED=0
RAN=0

log() { echo "[${TIMESTAMP}] $*"; }

log "====== Backup run started ======"

for script in "$BACKUP_D"/*.sh; do
    [ -f "$script" ] || continue
    [ -x "$script" ] || { log "SKIP (not executable): $(basename "$script")"; continue; }

    name="$(basename "$script")"
    log "--- START: $name ---"

    if bash "$script"; then
        log "--- OK:   $name ---"
    else
        log "--- FAIL: $name (exit $?) ---"
        FAILED=$((FAILED + 1))
    fi

    RAN=$((RAN + 1))
done

log "====== Backup run finished — ran: ${RAN}, failed: ${FAILED} ======"
exit "$FAILED"
