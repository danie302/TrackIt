# Story 20.4-001: Backup Strategy

## Metadata
- **Category**: DevOps
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 20.1-001
- **Assignee**: DevOps Engineer
- **Status**: Not Started

## Description
Implement automated backup strategy for database and uploaded files.

## Tasks
1. Create automated MongoDB backup script
2. Configure daily backups with retention policy (30 days)
3. Set up S3 bucket for backup storage
4. Implement file upload backups
5. Create restore procedure documentation
6. Test restore process
7. Schedule backups with cron/GitHub Actions
8. Add backup monitoring and alerts

## Acceptance Criteria
- Daily MongoDB backups automated
- Backups stored in S3 with 30-day retention
- File uploads backed up
- Restore procedure documented and tested
- Backup monitoring active
- Alerts on backup failures

## Technical Notes
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/db_$DATE"
tar -czf "/backups/db_$DATE.tar.gz" "/backups/db_$DATE"
aws s3 cp "/backups/db_$DATE.tar.gz" "s3://$BACKUP_BUCKET/mongodb/"
rm -rf "/backups/db_$DATE" "/backups/db_$DATE.tar.gz"

# Keep only last 30 days
aws s3 ls "s3://$BACKUP_BUCKET/mongodb/" | while read -r line; do
  createDate=$(echo $line|awk {'print $1" "$2'})
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date --date="30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line|awk {'print $4'})
    aws s3 rm "s3://$BACKUP_BUCKET/mongodb/$fileName"
  fi
done
```

## Related Files
- `scripts/backup.sh` (create)
- `scripts/restore.sh` (create)
- `docs/backup-restore.md` (create)
- `.github/workflows/backup.yml` (create cron job)
