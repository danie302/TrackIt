# Story 16.2-001: Backend Logging

## Metadata
- **Category**: Backend - Logging
- **Priority**: High
- **Estimated Effort**: 3 hours
- **Dependencies**: Story 16.1-001
- **Assignee**: Backend Developer
- **Status**: Not Started

## Description
Implement Winston logger for HTTP requests, errors, and database operations.

## Tasks
1. Install winston and nest-winston
2. Create `src/common/logger.config.ts`
3. Configure log levels: error, warn, info, debug
4. Add file transports for production
5. Log all HTTP requests
6. Log database queries in development
7. Add request ID for tracing

## Acceptance Criteria
- All HTTP requests logged
- Errors logged with stack traces
- Logs written to files in production
- Request IDs tracked

## Technical Notes
```typescript
// src/common/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});
```

## Related Files
- `src/common/logger.config.ts` (create)
- `src/main.ts` (configure logger)
