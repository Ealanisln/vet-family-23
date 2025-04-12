#!/bin/bash

# Load environment variables
set -a
source .env.production
set +a

# Extract database connection details from DATABASE_URL
DB_URL=$DATABASE_URL
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^\/]*\)\/.*/\1/p')
DB_NAME="neondb"
DB_USER="neondb_owner"
DB_PASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo "Creating backup from production..."
PGPASSWORD=$DB_PASSWORD pg_dump \
  --data-only \
  --no-owner \
  --no-privileges \
  --no-comments \
  --format=custom \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  --no-acl \
  --no-subscriptions \
  -f backup.dump

echo "Backup created successfully!"

# Now restore to local database
echo "Restoring to local database..."
set -a
source .env.local
set +a

DB_URL=$DATABASE_URL
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^\/]*\)\/.*/\1/p')
DB_NAME="neondb"
DB_USER="neondb_owner"
DB_PASSWORD=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

PGPASSWORD=$DB_PASSWORD pg_restore \
  --data-only \
  --no-owner \
  --no-privileges \
  --no-comments \
  -h $DB_HOST \
  -U $DB_USER \
  -d $DB_NAME \
  --no-acl \
  --no-subscriptions \
  backup.dump

echo "Restore completed!"

# Clean up
rm backup.dump

echo "Database sync completed successfully!" 