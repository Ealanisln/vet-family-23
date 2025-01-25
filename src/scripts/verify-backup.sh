#!/bin/bash

# Exit on error and undefined variables
set -eu

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check requirements
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql command not found. Install PostgreSQL client tools first."
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ Error: DATABASE_URL environment variable not set"
  exit 1
fi

# Run verification checks
echo "🔍 Running backup verification checks..."

# 1. Check uncompressed dump size
echo "\n📦 Backup file analysis:"
gunzip -l "backups/$(ls -t backups | head -1)"

# 2. Count records in active tables
echo "\n📊 Record counts:"
psql "${DATABASE_URL}" <<-SQL
  SELECT 
    (SELECT COUNT(*) FROM "User") AS users,
    (SELECT COUNT(*) FROM "Pet") AS pets,
    (SELECT COUNT(*) FROM "MedicalHistory") AS medical_history,
    (SELECT COUNT(*) FROM "InventoryItem") AS inventory_items;
SQL

# 3. Storage analysis with proper case handling
echo "\n📈 Storage analysis:"
psql "${DATABASE_URL}" <<-SQL
  \pset pager off
  \x auto
  SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(format('%I', table_name)::regclass)) as total_size,
    pg_size_pretty(pg_relation_size(format('%I', table_name)::regclass)) as data_size,
    pg_size_pretty(pg_indexes_size(format('%I', table_name)::regclass)) as index_size
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('User', 'Pet', 'MedicalHistory', 'InventoryItem', 'Vaccination')
  ORDER BY pg_total_relation_size(format('%I', table_name)::regclass) DESC;
SQL

echo "\n✅ Verification complete"