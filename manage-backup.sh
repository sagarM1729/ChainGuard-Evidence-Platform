#!/bin/bash

# ChainGuard Database Backup Management
# Usage: ./manage-backup.sh [backup|restore|list]

BACKUP_DIR="./database-backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function create_backup() {
    echo -e "${YELLOW}🔄 Creating database backup...${NC}"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Run the backup script
    npx tsx export-database.ts
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created successfully!${NC}"
        list_backups
    else
        echo -e "${RED}❌ Backup failed!${NC}"
        exit 1
    fi
}

function restore_backup() {
    echo -e "${YELLOW}📋 Available backups:${NC}"
    list_backups
    
    echo ""
    read -p "Enter the backup filename to restore: " backup_file
    
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  This will replace ALL current data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}🔄 Restoring database...${NC}"
        npx tsx restore-database.ts "$BACKUP_DIR/$backup_file"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database restored successfully!${NC}"
        else
            echo -e "${RED}❌ Restore failed!${NC}"
            exit 1
        fi
    else
        echo "Restore cancelled."
    fi
}

function list_backups() {
    echo -e "${YELLOW}📄 Available backups in $BACKUP_DIR:${NC}"
    
    if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
        echo "No backups found."
        return
    fi
    
    ls -la "$BACKUP_DIR"/*.json 2>/dev/null | while read -r line; do
        if [[ $line == *".json" ]]; then
            filename=$(basename "${line##* }")
            size=$(echo $line | awk '{print $5}')
            date=$(echo $line | awk '{print $6, $7, $8}')
            echo "  📁 $filename ($size bytes, $date)"
        fi
    done
}

function show_help() {
    echo "ChainGuard Database Backup Management"
    echo ""
    echo "Usage: ./manage-backup.sh [command]"
    echo ""
    echo "Commands:"
    echo "  backup    Create a new database backup"
    echo "  restore   Restore from an existing backup"
    echo "  list      List all available backups"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./manage-backup.sh backup     # Create new backup"
    echo "  ./manage-backup.sh restore    # Restore from backup"
    echo "  ./manage-backup.sh list       # List backups"
}

# Main script logic
case "$1" in
    backup)
        create_backup
        ;;
    restore)
        restore_backup
        ;;
    list)
        list_backups
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac