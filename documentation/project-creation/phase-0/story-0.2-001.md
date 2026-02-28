# Story 0.2-001: Create Docker Configuration for Development

## Metadata
- **Category:** Infrastructure
- **Priority:** Critical
- **Estimated Effort:** 4 hours
- **Dependencies:** Story 0.1-001, Story 0.1-002
- **Assignee:** TBD
- **Status:** Not Started

## Description
Create Docker configuration for all services in development mode with hot reload support for both frontend and backend.

## Tasks
1. Create `frontend/Dockerfile.dev` with Node base image and volume mounting
2. Create `backend/Dockerfile.dev` with Node base image and volume mounting
3. Create `docker-compose.yml` with services: frontend, backend, mongodb, redis
4. Configure MongoDB with initialization scripts
5. Configure Redis with persistence
6. Set up networking between containers
7. Create `.dockerignore` files for frontend and backend
8. Create `docker/README.md` with usage instructions

## Acceptance Criteria
- `docker-compose up` starts all services successfully
- Hot reload works for both frontend and backend
- MongoDB is accessible at localhost:27017
- Redis is accessible at localhost:6379
- Services can communicate with each other via container names
- Volume mounts preserve node_modules and allow code changes

## Technical Notes
### Docker Compose Services
- **frontend**: Vite dev server on port 5173
- **backend**: NestJS dev server on port 3000
- **mongodb**: MongoDB on port 27017
- **redis**: Redis on port 6379

### Volume Strategy
- Use bind mounts for source code (hot reload)
- Use named volumes for node_modules (performance)
- Use named volumes for MongoDB data (persistence)

## Testing Requirements
- Integration tests: Verify all services start and can communicate
- Test hot reload by modifying source files

## Documentation Requirements
- Document in `docker/README.md`:
  - How to start services
  - How to stop services
  - How to view logs
  - How to access services
  - Troubleshooting common issues

## Related Files
- `frontend/Dockerfile.dev`
- `backend/Dockerfile.dev`
- `docker-compose.yml`
- `frontend/.dockerignore`
- `backend/.dockerignore`
- `docker/README.md`

## Sample docker-compose.yml Structure
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://backend:3000
  
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/trackit
      - REDIS_HOST=redis
    depends_on:
      - mongodb
      - redis
  
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

## Notes
- Development containers should NOT be used in production
- Consider adding a health check for each service
- MongoDB and Redis data persists across container restarts
