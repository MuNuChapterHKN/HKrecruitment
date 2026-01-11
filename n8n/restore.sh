#!/bin/bash

CONTAINER_ID=$1
BACKUP_ROOT="./backup"

if [ -z "$CONTAINER_ID" ]; then
    echo "Usage: ./restore.sh <container_id>"
    exit 1
fi

# 1. List available backups
echo "Available backups:"
backups=($(ls -1 "$BACKUP_ROOT"))

if [ ${#backups[@]} -eq 0 ]; then
    echo "No backups found in $BACKUP_ROOT"
    exit 1
fi

for i in "${!backups[@]}"; do
    echo "[$i] ${backups[$i]}"
done

# 2. Get user selection
read -p "Select backup index to restore: " INDEX

SELECTED_BACKUP="${backups[$INDEX]}"
if [ -z "$SELECTED_BACKUP" ]; then
    echo "Invalid selection."
    exit 1
fi

BACKUP_PATH="$BACKUP_ROOT/$SELECTED_BACKUP"

echo "Restoring from: $BACKUP_PATH..."

# 3. Restore Workflows
cat "$BACKUP_PATH/workflows.json" | docker exec -i $CONTAINER_ID n8n import:workflow --input=-

# 4. Restore Credentials
cat "$BACKUP_PATH/credentials.json" | docker exec -i $CONTAINER_ID n8n import:credentials --input=-

# 5. Restore Data Tables (Entities)
if [ -d "$BACKUP_PATH/entities" ]; then
    docker exec $CONTAINER_ID mkdir -p /tmp/n8n_restore_entities
    docker cp "$BACKUP_PATH/entities/." "$CONTAINER_ID:/tmp/n8n_restore_entities/"
    docker exec $CONTAINER_ID n8n import:entities --inputDir=/tmp/n8n_restore_entities
    docker exec $CONTAINER_ID rm -rf /tmp/n8n_restore_entities
fi

echo "Restore complete."
