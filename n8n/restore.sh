#!/bin/bash

CONTAINER_ID=$1
SSH_HOST=$2
BACKUP_ROOT="./backup"

if [ -z "$CONTAINER_ID" ]; then
    echo "Usage: ./restore.sh <container_id> [ssh_host]"
    echo "  container_id: Docker container ID or name"
    echo "  ssh_host: (optional) SSH host in format user@host or host"
    echo ""
    echo "Examples:"
    echo "  ./restore.sh n8n_container"
    echo "  ./restore.sh n8n_container user@remote.server.com"
    exit 1
fi

DOCKER_CMD="docker"
if [ -n "$SSH_HOST" ]; then
    echo "Using SSH connection to $SSH_HOST..."
    DOCKER_CMD="ssh $SSH_HOST docker"
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

# Helper function to copy files to container
copy_to_container() {
    local src=$1
    local dest=$2
    
    if [ -n "$SSH_HOST" ]; then
        # For SSH: copy file to remote host first, then docker cp
        REMOTE_TEMP="/tmp/n8n_restore_$(basename $src)_$(date +%s)"
        scp "$src" "$SSH_HOST:$REMOTE_TEMP"
        ssh $SSH_HOST "docker cp $REMOTE_TEMP $CONTAINER_ID:$dest && rm -f $REMOTE_TEMP"
    else
        # Local docker: direct copy
        docker cp "$src" "$CONTAINER_ID:$dest"
    fi
}

# 3. Restore Workflows
echo "Restoring workflows..."
copy_to_container "$BACKUP_PATH/workflows.json" "/tmp/workflows.json"
$DOCKER_CMD exec $CONTAINER_ID n8n import:workflow --input=/tmp/workflows.json
$DOCKER_CMD exec $CONTAINER_ID rm -f /tmp/workflows.json 2>/dev/null || true

# 4. Restore Credentials
echo "Restoring credentials..."
copy_to_container "$BACKUP_PATH/credentials.json" "/tmp/credentials.json"
$DOCKER_CMD exec $CONTAINER_ID n8n import:credentials --input=/tmp/credentials.json
$DOCKER_CMD exec $CONTAINER_ID rm -f /tmp/credentials.json 2>/dev/null || true

# 5. Restore Data Tables (Entities)
if [ -d "$BACKUP_PATH/entities" ]; then
    echo "Restoring entities..."
    $DOCKER_CMD exec $CONTAINER_ID mkdir -p /tmp/n8n_restore_entities
    
    if [ -n "$SSH_HOST" ]; then
        # For SSH: create archive locally, copy to remote, extract to container
        TEMP_ARCHIVE="/tmp/n8n_entities_restore_$(date +%s).tar"
        tar -cf "$TEMP_ARCHIVE" -C "$BACKUP_PATH/entities" .
        scp "$TEMP_ARCHIVE" "$SSH_HOST:$TEMP_ARCHIVE"
        ssh $SSH_HOST "docker cp $TEMP_ARCHIVE $CONTAINER_ID:/tmp/n8n_entities_restore.tar && rm -f $TEMP_ARCHIVE"
        $DOCKER_CMD exec $CONTAINER_ID tar -xf /tmp/n8n_entities_restore.tar -C /tmp/n8n_restore_entities
        $DOCKER_CMD exec $CONTAINER_ID rm -f /tmp/n8n_entities_restore.tar
        rm -f "$TEMP_ARCHIVE"
    else
        # Local docker: direct copy
        docker cp "$BACKUP_PATH/entities/." "$CONTAINER_ID:/tmp/n8n_restore_entities/"
    fi
    
    # Check if entities import succeeds
    if $DOCKER_CMD exec $CONTAINER_ID n8n import:entities --inputDir=/tmp/n8n_restore_entities; then
        echo "✅ Entities restored successfully"
    else
        echo "⚠️  Entities restore failed - this is likely due to encryption key mismatch"
        echo "   Make sure N8N_ENCRYPTION_KEY in your container matches the backup source"
    fi
    
    $DOCKER_CMD exec $CONTAINER_ID rm -rf /tmp/n8n_restore_entities 2>/dev/null || true
fi

echo ""
echo "✅ Restore complete!"
echo "   - Workflows: ✅"
echo "   - Credentials: ✅"
echo ""
echo "⚠️  If entities failed to restore, check that N8N_ENCRYPTION_KEY matches the backup source."
