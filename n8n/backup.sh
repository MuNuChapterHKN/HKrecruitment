#!/bin/bash

# Configuration
CONTAINER_ID=$1
BACKUP_DIR="./backup/$(date +%Y-%m-%d_%H-%M-%S)"

if [ -z "$CONTAINER_ID" ]; then
    echo "Usage: ./backup.sh <container_id>"
    exit 1
fi

# Create local backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting n8n backup for container: $CONTAINER_ID..."

# 1. Export Workflows
docker exec $CONTAINER_ID n8n export:workflow --all > "$BACKUP_DIR/workflows.json"

# 2. Export Credentials (Encrypted)
docker exec $CONTAINER_ID n8n export:credentials --all > "$BACKUP_DIR/credentials.json"

# 3. Export Internal Data Tables (Entities)
# We create a temp dir inside the container because export:entities requires an output directory
docker exec $CONTAINER_ID mkdir -p /tmp/n8n_entities
docker exec $CONTAINER_ID n8n export:entities --outputDir=/tmp/n8n_entities
docker cp "$CONTAINER_ID:/tmp/n8n_entities/." "$BACKUP_DIR/entities/"
docker exec $CONTAINER_ID rm -rf /tmp/n8n_entities

echo "Backup complete. Files saved to: $BACKUP_DIR"
ls -R "$BACKUP_DIR"
