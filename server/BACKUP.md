# Pave Database Backup System

This document explains how to back up and restore the Pave MongoDB database.

## Overview

Since MongoDB Atlas free tier doesn't include scheduled backups, Pave provides:

1. **CLI Backup Script** - Run manually or via cron
2. **GitHub Actions Workflow** - Automated daily backups
3. **User Export API** - Per-user data export via `/api/export`

## Quick Start

### 1. Set Up Environment Variables

```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
```

### 2. Run a Manual Backup

```bash
cd server
npm run backup
```

This creates a compressed backup file in `server/backups/`:
```
pave-backup-2024-01-15T10-30-00.json.gz
```

### 3. Restore from Backup

```bash
# List available backups
npm run restore

# Restore specific backup
npm run restore pave-backup-2024-01-15T10-30-00.json.gz
```

⚠️ **Warning**: Restore will **delete all existing data** in the database before restoring.

## Automated Backups (GitHub Actions)

The `.github/workflows/backup.yml` workflow runs:

- **Daily at 2:00 AM UTC** (configurable via cron)
- **On manual trigger** (workflow_dispatch)

### Setup

1. Add `MONGO_URI` as a GitHub Repository Secret:
   - Go to Settings → Secrets and variables → Actions → New repository secret
   - Name: `MONGO_URI`
   - Value: Your MongoDB connection string

2. The workflow will:
   - Create a backup
   - Upload as GitHub Artifact (30-day retention)
   - Create a pre-release with the backup file
   - Keep only the last 10 backups locally

### Accessing Backups

- **Artifacts**: Actions tab → workflow run → Artifacts
- **Releases**: Releases page → Pre-releases tagged `backup-{run_id}`

## Backup Contents

Each backup includes all collections:

| Collection | Description |
|------------|-------------|
| `users` | User accounts (email, name, password hash) |
| `transactions` | Income, expenses, savings records |
| `budgetPlans` | Monthly budget allocations |
| `bills` | Recurring bill definitions |
| `goals` | Savings goals with targets |
| `settings` | User preferences (budget rules, reminders, app lock) |
| `categories` | Custom categories |
| `accounts` | Asset/liability account balances |
| `investments` | Investment tracker data |

## Backup File Format

```json
{
  "exportedAt": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "collections": {
    "users": [...],
    "transactions": [...],
    "budgetPlans": [...],
    "bills": [...],
    "goals": [...],
    "settings": [...],
    "categories": [...],
    "accounts": [...],
    "investments": [...]
  }
}
```

Files are gzip-compressed (`.json.gz`).

## User-Level Export (API)

For individual users, use the built-in export endpoint:

```
GET /api/export
Authorization: Bearer <token>
```

Returns a JSON file with only that user's data.

## Disaster Recovery Plan

1. **Daily**: GitHub Actions creates automated backups
2. **Before major changes**: Run `npm run backup` manually
3. **Storage**: Backups stored in:
   - GitHub Artifacts (30 days)
   - GitHub Pre-releases (indefinite)
   - Local `server/backups/` (if running locally)

## Restore Procedure

### From GitHub Release

1. Download backup from Releases page
2. Place in `server/backups/`
3. Run restore:
   ```bash
   cd server
   npm run restore pave-backup-2024-01-15T10-30-00.json.gz
   ```

### From Local File

```bash
cd server
npm run restore ./backups/pave-backup-2024-01-15T10-30-00.json.gz
```

## Security Notes

- Backups contain **password hashes** (bcrypt) - not plaintext passwords
- Store backups securely - they contain all user financial data
- GitHub pre-releases are visible to anyone with repo access
- Consider encrypting backups before storing externally

## Troubleshooting

### "MONGO_URI is required"
Ensure `.env` file exists with valid `MONGO_URI`

### "Authentication failed"
Check MongoDB Atlas network access (IP whitelist) and credentials

### "Backup directory not found"
Run `mkdir -p server/backups` or set `BACKUP_DIR` in `.env`

### Restore hangs
Large databases may take time. Check MongoDB connection and indexes.

## Customization

### Change Backup Schedule

Edit `.github/workflows/backup.yml`:
```yaml
on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM UTC
    # For weekly: "0 2 * * 0" (Sunday)
    # For hourly: "0 * * * *"
```

### Change Retention

Edit the cleanup step in `backup.yml`:
```bash
ls -t *.json.gz | tail -n +11 | xargs -r rm -f  # Keep last 10
```

### Add External Storage

Add a step to upload to S3, Google Drive, etc. after backup creation.