# Backups

The `backup` container runs all `*.sh` scripts in `scripts/backup/backup.d/` on a cron schedule. Scripts execute in alphabetical order; failures are logged but don't stop the run.

| Script           | Purpose                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `01-postgres.sh` | Dumps all databases with `pg_dump` (custom format, max compression)      |
| `02-gdrive.sh`   | Uploads to Google Drive via `rclone`, then purges local files on success |

## Environment variables

```env
BACKUP_CRON=0 2 * * *          # any cron expression (default: 2am daily)
BACKUP_RETENTION_DAYS=7        # local fallback retention when Drive is not configured
BACKUP_ON_START=false          # run once immediately on container start
GDRIVE_REMOTE=gdrive           # rclone remote name
GDRIVE_PATH=HKR/backups        # destination path in Google Drive
```

## Google Drive setup

No local rclone install needed. Port `53682` must be exposed so rclone's OAuth callback listener is reachable from the browser:

```bash
docker run --rm -it \
  -p 53682:53682 \
  -v ./scripts/backup:/config/rclone \
  rclone/rclone \
  config
```

Follow the prompts: `n` → new remote, name `gdrive`, type `drive`, scope `drive`. Answer **`y`** to "Use auto config?" — rclone starts a local listener, opens a browser URL, and catches the OAuth redirect on `127.0.0.1:53682` via the mapped port. The config is written to `scripts/backup/rclone.conf` automatically.

The file is gitignored. If absent, `02-gdrive.sh` skips silently and local retention applies.

## Usage

```bash
# Start
docker compose up -d backup

# Trigger manually
docker compose exec backup /usr/local/bin/run.sh

# Logs
docker compose logs -f backup
```

## Restore

```bash
# Download from Drive
rclone copy "gdrive:HKR/backups/postgres/<timestamp>/<db>.dump" .

# Restore
pg_restore --host=localhost --username=<user> --dbname=<db> --clean --if-exists <db>.dump
```

## Adding a script

Drop a numbered `*.sh` file into `scripts/backup/backup.d/`. It is picked up on the next run with no rebuild needed.

Available env vars: `BACKUP_DIR`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `DB_HKR_DATABASE`, `DB_N8N_DATABASE`.
