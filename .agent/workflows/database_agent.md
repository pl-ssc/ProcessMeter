---
description: "Database Agent - Handles all database operations including migrations, backups, and data management."
---

# Database Agent Workflow

This workflow provides a set of commands and procedures for managing the PostgreSQL database in the ProcessMeter project.

## 1. Check Database Status
Checks if the database container is running and accessible.

```bash
docker ps | grep postgres
# Check connection
// turbo
npm run db:migrate -- --help # Just to check node script connectivity
```

## 2. Run Migrations
Synchronizes the database schema and data from the reference database.

**Command:**
```bash
npm run db:migrate
```

## 3. Create Backup
Creates a backup of the current database schema and data.

**Command:**
```bash
# Ensure backup directory exists
mkdir -p db/backups
# Create backup filename with timestamp
BACKUP_FILE="db/backups/backup_$(date +%Y%m%d_%H%M%S).sql"
# Run pg_dump from within the container or using local tools if installed
# Using docker exec pattern (adjust container name if needed, usually processmeter-db-1 or similar)
# Or using local pg_dump if available and connected via localhost
pg_dump $DATABASE_URL > $BACKUP_FILE
echo "Backup created at $BACKUP_FILE"
```

## 4. Restore Backup
Restores the database from a specific backup file.

**Command:**
```bash
# List available backups
ls -lh db/backups/
# User must select a file, e.g., db/backups/backup_20240101.sql
# RESTORE_FILE="db/backups/YOUR_FILE.sql"
# psql $DATABASE_URL < $RESTORE_FILE
```

## 5. Seed Data / Reset
Resets the database to a clean state using the reference data.

**Command:**
```bash
npm run db:migrate
```

## 6. Inspect Schema
Shows the current database schema structure..

**Command:**
```bash
psql $DATABASE_URL -c "\dt"
```
