#!/bin/bash

# Configuration
CONTAINER_ID=$1
SSH_HOST=$2
BACKUP_DIR="./backup/$(date +%Y-%m-%d_%H-%M-%S)"

if [ -z "$CONTAINER_ID" ]; then
    echo "Usage: ./backup.sh <container_id> [ssh_host]"
    echo "  container_id: Docker container ID or name"
    echo "  ssh_host: (optional) SSH host in format user@host or host"
    echo ""
    echo "Examples:"
    echo "  ./backup.sh n8n_container"
    echo "  ./backup.sh n8n_container user@remote.server.com"
    exit 1
fi

DOCKER_CMD="docker"
if [ -n "$SSH_HOST" ]; then
    echo "Using SSH connection to $SSH_HOST..."
    DOCKER_CMD="ssh $SSH_HOST docker"
fi

# Create local backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting n8n backup for container: $CONTAINER_ID..."

# 1. Export Workflows
$DOCKER_CMD exec $CONTAINER_ID n8n export:workflow --all > "$BACKUP_DIR/workflows.json"

# 2. Export Credentials (Encrypted)
$DOCKER_CMD exec $CONTAINER_ID n8n export:credentials --all > "$BACKUP_DIR/credentials.json"

# 3. Export Internal Data Tables (Entities)
# We create a temp dir inside the container because export:entities requires an output directory
$DOCKER_CMD exec $CONTAINER_ID mkdir -p /tmp/n8n_entities
$DOCKER_CMD exec $CONTAINER_ID n8n export:entities --outputDir=/tmp/n8n_entities

# Copy entities from container
mkdir -p "$BACKUP_DIR/entities"
if [ -n "$SSH_HOST" ]; then
    # For SSH: create a temporary archive on the remote host, copy it, then extract
    TEMP_ARCHIVE="/tmp/n8n_entities_$(date +%s).tar"
    ssh $SSH_HOST "docker cp $CONTAINER_ID:/tmp/n8n_entities/. /tmp/n8n_entities_local && tar -cf $TEMP_ARCHIVE -C /tmp/n8n_entities_local . && rm -rf /tmp/n8n_entities_local"
    scp $SSH_HOST:$TEMP_ARCHIVE "$BACKUP_DIR/entities.tar"
    tar -xf "$BACKUP_DIR/entities.tar" -C "$BACKUP_DIR/entities/"
    rm "$BACKUP_DIR/entities.tar"
    ssh $SSH_HOST "rm -f $TEMP_ARCHIVE"
else
    # Local docker: direct copy
    docker cp "$CONTAINER_ID:/tmp/n8n_entities/." "$BACKUP_DIR/entities/"
fi

$DOCKER_CMD exec $CONTAINER_ID rm -rf /tmp/n8n_entities

echo "Backup complete. Files saved to: $BACKUP_DIR"
ls -R "$BACKUP_DIR"
