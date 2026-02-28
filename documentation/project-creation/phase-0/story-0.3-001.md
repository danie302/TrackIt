# Story 0.3-001: Set Up MongoDB Connection and Mongoose Configuration

## Metadata
- **Category:** Backend
- **Priority:** Critical
- **Estimated Effort:** 3 hours
- **Dependencies:** Story 0.1-002, Story 0.2-001
- **Assignee:** TBD
- **Status:** Not Started

## Description
Configure MongoDB connection in the NestJS backend using Mongoose with proper error handling and health checks.

## Tasks
1. Install `@nestjs/mongoose` and `mongoose`
2. Create database configuration module in `src/config/database.config.ts`
3. Configure MongooseModule in `app.module.ts` with connection options
4. Set up connection string from environment variables (`MONGODB_URI`)
5. Add connection error handling and logging
6. Create database health check service
7. Test connection with basic query
8. Configure connection pool settings

## Acceptance Criteria
- Backend connects to MongoDB successfully on startup
- Connection errors are logged properly with meaningful messages
- Health check endpoint returns database status
- Connection pool is configured (min: 10, max: 100 connections)
- Automatic reconnection works on connection loss
- Database connection closes gracefully on app shutdown

## Technical Notes
- Use `mongoose.connect()` with options:
  - `autoIndex: false` in production
  - `maxPoolSize: 100`
  - `serverSelectionTimeoutMS: 5000`
- Health check should verify:
  - Connection state
  - Database ping response
  - Available connections in pool

## Testing Requirements
- Unit tests: Database config module
- Integration tests: Test actual MongoDB connection
- Test connection failure scenarios

## Documentation Requirements
- Document MongoDB environment variables in backend/.env.example
- Add connection troubleshooting guide to backend/README.md

## Related Files
- `backend/src/config/database.config.ts` (create)
- `backend/src/app.module.ts` (modify)
- `backend/src/health/health.controller.ts` (create)
- `backend/.env.example` (update)

## Notes
- MongoDB should run in Docker container from docker-compose.yml
- In development, MongoDB runs on localhost:27017
- In production, use managed MongoDB service (MongoDB Atlas) or replica set
