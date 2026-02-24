#!/bin/bash
# Copies local backups to Google Drive, then deletes local files on success.
# Uses rclone copy (not sync) so Drive accumulates all historical backups
# while local storage is kept minimal.
#
# Setup (run once on your local machine, then copy the resulting config):
#
#   rclone config
#     -> New remote -> name: "gdrive" -> type: "drive"
#     -> client_id / client_secret: leave blank to use rclone defaults,
#        or supply your own Google OAuth2 app credentials
#     -> scope: "drive" (full access)
#     -> Follow the browser auth flow to obtain and store the refresh token
#
#   cp ~/.config/rclone/rclone.conf ./scripts/backup/rclone.conf
#
# The rclone.conf is mounted read-only into the container.
# It contains the refresh_token; rclone refreshes the access_token automatically.

set -euo pipefail

BACKUP_BASE="${BACKUP_DIR:-/backups}"
GDRIVE_REMOTE="${GDRIVE_REMOTE:-gdrive}"
GDRIVE_PATH="${GDRIVE_PATH:-HKR/backups}"
RCLONE_CONFIG="${RCLONE_CONFIG:-/config/rclone/rclone.conf}"

if [ ! -f "$RCLONE_CONFIG" ]; then
    echo "rclone config not found at $RCLONE_CONFIG — skipping Google Drive upload"
    echo "See the header of this script for setup instructions."
    exit 0
fi

if ! RCLONE_CONFIG="$RCLONE_CONFIG" rclone listremotes 2>/dev/null | grep -q "^${GDRIVE_REMOTE}:"; then
    echo "Remote '${GDRIVE_REMOTE}' not found in rclone config — skipping"
    exit 0
fi

echo "Copying ${BACKUP_BASE} -> ${GDRIVE_REMOTE}:${GDRIVE_PATH}"
if RCLONE_CONFIG="$RCLONE_CONFIG" rclone copy "$BACKUP_BASE" "${GDRIVE_REMOTE}:${GDRIVE_PATH}" \
    --stats-one-line \
    --log-level INFO; then
    echo "Upload complete — purging local backups..."
    find "${BACKUP_BASE:?}" -mindepth 1 -delete
    echo "Local backups purged. Google Drive is the source of truth."
else
    echo "Upload FAILED — local backups preserved."
    exit 1
fi
