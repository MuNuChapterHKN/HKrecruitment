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
echo "Restoring workflows..."
docker cp "$BACKUP_PATH/workflows.json" "$CONTAINER_ID:/tmp/workflows.json"
docker exec $CONTAINER_ID n8n import:workflow --input=/tmp/workflows.json
docker exec $CONTAINER_ID rm -f /tmp/workflows.json 2>/dev/null || true

# 4. Restore Credentials
echo "Restoring credentials..."
docker cp "$BACKUP_PATH/credentials.json" "$CONTAINER_ID:/tmp/credentials.json"
docker exec $CONTAINER_ID n8n import:credentials --input=/tmp/credentials.json
docker exec $CONTAINER_ID rm -f /tmp/credentials.json 2>/dev/null || true

# 5. Restore Data Tables (Entities)
if [ -d "$BACKUP_PATH/entities" ]; then
    echo "Restoring entities..."
    docker exec $CONTAINER_ID mkdir -p /tmp/n8n_restore_entities
    docker cp "$BACKUP_PATH/entities/." "$CONTAINER_ID:/tmp/n8n_restore_entities/"
    
    # Check if entities import succeeds
    if docker exec $CONTAINER_ID n8n import:entities --inputDir=/tmp/n8n_restore_entities; then
        echo "✅ Entities restored successfully"
    else
        echo "⚠️  Entities restore failed - this is likely due to encryption key mismatch"
        echo "   Make sure N8N_ENCRYPTION_KEY in your container matches the backup source"
    fi
    
    docker exec $CONTAINER_ID rm -rf /tmp/n8n_restore_entities 2>/dev/null || true
fi

echo ""
echo "✅ Restore complete!"
echo "   - Workflows: ✅"
echo "   - Credentials: ✅"
echo ""
echo "⚠️  If entities failed to restore, check that N8N_ENCRYPTION_KEY matches the backup source."
