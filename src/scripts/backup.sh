#!/bin/bash

# Exit on error and undefined variables
set -eu

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check for DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p backups

# Generate timestamp and filename
TIMESTAMP=$(date +%Y%m%d%H%M%S)
BACKUP_FILE="backups/backup_${TIMESTAMP}.sql.gz"

# Execute pg_dump with gzip compression
echo "🔍 Database URL: ${DATABASE_URL%%@*}" # Show simplified connection string
echo "⏳ Starting backup..."

if pg_dump -v "${DATABASE_URL}" --no-owner --no-acl | gzip > "${BACKUP_FILE}"; then
  echo "✅ Backup completed successfully: ${BACKUP_FILE}"
  echo "💾 Size: $(du -h ${BACKUP_FILE} | cut -f1)"
else
  echo "❌ Backup failed"
  rm -f "${BACKUP_FILE}"
  exit 1
fi