# Story 20.1-001: Production Docker

## Metadata
- **Category**: DevOps
- **Priority**: High
- **Estimated Effort**: 4 hours
- **Dependencies**: Story 0.2-001
- **Assignee**: DevOps Engineer
- **Status**: Not Started

## Description
Optimize Docker setup for production with multi-stage builds and health checks.

## Tasks
1. Create production Dockerfile with multi-stage build
2. Optimize image size
3. Add health check endpoints
4. Configure production docker-compose.yml
5. Add nginx reverse proxy
6. Configure SSL certificates
7. Add container health checks
8. Document production Docker commands

## Acceptance Criteria
- Production Dockerfile optimized
- Image size <500MB
- Health checks working
- Nginx configured
- SSL enabled
- docker-compose production-ready

## Technical Notes
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
```

## Related Files
- Dockerfile.prod (create)
- docker-compose.prod.yml (create)
- nginx.conf (create)
