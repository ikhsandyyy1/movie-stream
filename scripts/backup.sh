#!/bin/bash
# scripts/backup.sh — Supabase database backup

set -euo pipefail

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
OUTPUT_FILE="$BACKUP_DIR/$TIMESTAMP.dump"

pg_dump \
  --dbname="${SUPABASE_DB_URL:?SUPABASE_DB_URL is not set}" \
  --format=custom \
  --file="$OUTPUT_FILE" \
  --no-owner \
  --exclude-table-data='audit_events'

echo "Backup saved to $OUTPUT_FILE"
