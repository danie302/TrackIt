# Story 20.3-001: Monitoring & Alerting

## Metadata
- **Category**: DevOps
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 20.1-001
- **Assignee**: DevOps Engineer
- **Status**: Not Started

## Description
Implement monitoring with PM2/New Relic and error tracking with Sentry.

## Tasks
1. Install and configure PM2 for process management
2. Set up New Relic APM (optional)
3. Configure Sentry for error tracking
4. Add uptime monitoring with UptimeRobot
5. Configure alerts for critical errors
6. Add performance metrics dashboard
7. Set up log aggregation

## Acceptance Criteria
- PM2 managing all processes
- Sentry capturing errors
- Uptime monitoring active
- Alerts configured for downtime/errors
- Performance dashboard accessible

## Technical Notes
```bash
# PM2 configuration
pm2 start dist/main.js --name trackit-api -i max
pm2 startup
pm2 save

# Sentry integration
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

## Related Files
- `ecosystem.config.js` (PM2 config - create)
- `src/main.ts` (add Sentry)
