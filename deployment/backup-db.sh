#!/bin/bash

# Database backup script
# Schedule with cron: 0 2 * * * /var/www/institute-api/deployment/backup-db.sh

BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="institute_db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup: $DB_NAME at $DATE"
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup complete: ${DB_NAME}_${DATE}.sql.gz"
