#!/bin/bash
# Usage: ./restore-db.sh <backup_file.sql.gz>
set -eo pipefail

# --------------------------
# Configuration
# --------------------------
DB_NAME="vetapp"
DB_USER="myuser"
DOCKER_SERVICE="postgres"
BACKUP_FILE="$1"

# --------------------------
# Validation
# --------------------------
if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Error: Please specify backup file"
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file $BACKUP_FILE not found"
  exit 1
fi

# --------------------------
# Restore Process
# --------------------------
echo "🚀 Starting restore process..."
echo "⏳ Step 1/4: Stopping application containers..."
docker-compose stop app || echo "⚠️ Warning: Failed to stop app containers"

echo "⏳ Step 2/4: Applying latest migrations..."
docker-compose up -d $DOCKER_SERVICE
npx prisma migrate deploy

echo "⏳ Step 3/4: Restoring data (this may take several minutes)..."
start_time=$(date +%s)

gunzip -c "$BACKUP_FILE" | \
  docker-compose exec -T $DOCKER_SERVICE psql -U $DB_USER -d $DB_NAME \
    -v ON_ERROR_STOP=1 \
    -c "SET session_replication_role = replica; \
        SET CONSTRAINTS ALL DEFERRED;" \
    -f - \
    -c "SET session_replication_role = DEFAULT;"

end_time=$(date +%s)
echo "✅ Data restored in $((end_time - start_time)) seconds"

echo "⏳ Step 4/4: Verifying restoration..."
docker-compose exec $DOCKER_SERVICE psql -U $DB_USER -d $DB_NAME -c \
  "SELECT 
    (SELECT COUNT(*) FROM \"InventoryItem\") AS inventory_items,
    (SELECT COUNT(*) FROM \"User\") AS users,
    (SELECT COUNT(*) FROM \"Pet\") AS pets"

echo "🎉 Restore completed successfully"
echo "🚀 Starting application containers..."
docker-compose up -d

# Usage: 
# chmod +x restore-db.sh
# ./restore-db.sh backups/clean_backup_20250125104944.sql.gz