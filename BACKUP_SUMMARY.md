# ChainGuard Database Backup Guide

## � **Your Backup Location**

```
📁 /home/ajay/Project/ChainGuard-Evidence-Platform/database-backups/
```

## � **Current Backup**

- **File**: `chainguard_data_export_2025-10-02T17-27-17.json`
- **Size**: 20.8 KB
- **Created**: October 2, 2025 at 22:57
- **Contains**: All your cases, evidence, users, and system data

## 🛠️ **How to Use Backup System**

### 📋 List All Backups
```bash
./manage-backup.sh list
```

### 💾 Create New Backup
```bash
./manage-backup.sh backup
```
**Use this whenever you add new cases, evidence, or users!**

### 🔄 Restore from Backup
```bash
./manage-backup.sh restore
```
**⚠️ Warning**: This will replace ALL current data!

### 📖 Help
```bash
./manage-backup.sh help
```

## 🆘 **Emergency Restore Instructions**

If something goes wrong and you need to restore your data:

1. **Quick restore** (using your current backup):
   ```bash
   npx tsx restore-database.ts database-backups/chainguard_data_export_2025-10-02T17-27-17.json
   ```

2. **Interactive restore** (choose from list):
   ```bash
   ./manage-backup.sh restore
   ```

3. **After restore**, regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

## 📋 **Regular Backup Schedule**

**Recommended**: Create a backup:
- ✅ Before any database changes
- ✅ After adding important cases/evidence
- ✅ Weekly (for regular data)
- ✅ Before system updates

**Quick backup command**: `./manage-backup.sh backup`

## 📊 **What's Backed Up**

Your current backup contains:
- **2 Cases** with full investigation data
- **4 Evidence items** with file metadata
- **2 User accounts** (passwords need reset after restore)
- **5 Whitelist entries**
- **All relationships** between data

## ✅ **Files You Need**

Keep these files for backup management:
- `manage-backup.sh` - Main backup tool
- `export-database.ts` - Creates backups
- `restore-database.ts` - Restores backups
- `database-backups/` folder - Contains all backups

---

**Last Updated**: October 2, 2025
**Backup Status**: ✅ Current data safely backed up