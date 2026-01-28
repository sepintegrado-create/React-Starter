#!/bin/bash
# Database Backup Script for AWS RDS PostgreSQL
# Usage: ./backup-db.sh [environment]

set -e

ENVIRONMENT=${1:-prod}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/sepi_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
else
    echo "❌ Environment file .env.${ENVIRONMENT} not found"
    exit 1
fi

# Create backup directory
mkdir -p ${BACKUP_DIR}

echo "🔄 Starting database backup..."
echo "Environment: ${ENVIRONMENT}"
echo "Timestamp: ${TIMESTAMP}"

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Perform backup using pg_dump
echo "📦 Creating backup file: ${BACKUP_FILE}"
PGPASSWORD=${DB_PASS} pg_dump \
    -h ${DB_HOST} \
    -p ${DB_PORT} \
    -U ${DB_USER} \
    -d ${DB_NAME} \
    -F c \
    -f ${BACKUP_FILE}

# Compress backup
echo "🗜️  Compressing backup..."
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# Upload to S3
if [ ! -z "$AWS_S3_BACKUP_BUCKET" ]; then
    echo "☁️  Uploading to S3..."
    aws s3 cp ${BACKUP_FILE} s3://${AWS_S3_BACKUP_BUCKET}/database-backups/
    echo "✅ Backup uploaded to S3"
fi

# Calculate file size
FILE_SIZE=$(du -h ${BACKUP_FILE} | cut -f1)

echo ""
echo "✅ Backup completed successfully!"
echo "File: ${BACKUP_FILE}"
echo "Size: ${FILE_SIZE}"
echo ""
echo "To restore this backup, run:"
echo "  gunzip ${BACKUP_FILE}"
echo "  pg_restore -h HOST -U USER -d DATABASE ${BACKUP_FILE%.gz}"
echo ""

# Clean up old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find ${BACKUP_DIR} -name "sepi_${ENVIRONMENT}_*.sql.gz" -mtime +7 -delete
echo "✅ Cleanup completed"
