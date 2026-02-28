# TrackIt Docker Configuration

Docker development environment for TrackIt with hot reload support.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose V2+
- At least 4GB RAM allocated to Docker

## Services

The docker-compose configuration includes:

| Service | Port | Description |
|---------|------|-------------|
| frontend | 5173 | Vite dev server with hot reload |
| backend | 3000 | NestJS dev server with hot reload |
| mongodb | 27017 | MongoDB 7 database |
| redis | 6379 | Redis 7 cache |

## Quick Start

### Start All Services

```bash
# Build and start all services
docker-compose up

# Or run in detached mode (background)
docker-compose up -d
```

### Stop All Services

```bash
# Stop services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers, and delete volumes (⚠️ deletes data)
docker-compose down -v
```

## Individual Service Commands

### Start Specific Services

```bash
# Start only database services
docker-compose up mongodb redis

# Start only backend
docker-compose up backend

# Start only frontend
docker-compose up frontend
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild and restart
docker-compose up --build
```

## Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100
```

## Accessing Services

### Frontend
- **URL**: http://localhost:5173
- **Hot Reload**: Enabled - changes to files in `frontend/src` trigger automatic reload

### Backend
- **URL**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Hot Reload**: Enabled - changes to files in `backend/src` trigger automatic restart

### MongoDB
- **Connection**: mongodb://localhost:27017/trackit
- **Database**: trackit
- **GUI**: Use MongoDB Compass or similar tool

### Redis
- **Connection**: localhost:6379
- **CLI**: `docker-compose exec redis redis-cli`

## Executing Commands Inside Containers

### Backend Container

```bash
# Open shell
docker-compose exec backend sh

# Run NestJS CLI commands
docker-compose exec backend nest --help

# Install new package
docker-compose exec backend npm install package-name

# Run tests
docker-compose exec backend npm run test
```

### Frontend Container

```bash
# Open shell
docker-compose exec frontend sh

# Install new package
docker-compose exec frontend npm install package-name

# Run build
docker-compose exec frontend npm run build
```

### MongoDB Container

```bash
# Open MongoDB shell
docker-compose exec mongodb mongosh trackit

# Backup database
docker-compose exec mongodb mongodump --db=trackit --out=/data/backup

# Restore database
docker-compose exec mongodb mongorestore /data/backup
```

### Redis Container

```bash
# Open Redis CLI
docker-compose exec redis redis-cli

# Check Redis info
docker-compose exec redis redis-cli INFO

# Monitor Redis commands
docker-compose exec redis redis-cli MONITOR
```

## Data Persistence

Data is persisted using Docker named volumes:

- **mongodb_data**: MongoDB database files
- **redis_data**: Redis persistence files

To delete all data:
```bash
docker-compose down -v
```

## Hot Reload

### Frontend (Vite)
- Changes to files in `frontend/src` trigger instant hot module replacement
- No need to restart the container

### Backend (NestJS)
- Changes to files in `backend/src` trigger automatic server restart
- Watch mode is enabled by default with `npm run start:dev`

## Troubleshooting

### Services Won't Start

**Check if ports are already in use:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173
netstat -ano | findstr :27017
netstat -ano | findstr :6379
```

**Kill processes using the ports if needed.**

### Hot Reload Not Working

**Frontend:**
1. Check that files are being watched: `docker-compose logs -f frontend`
2. Try rebuilding: `docker-compose up --build frontend`

**Backend:**
1. Check NestJS watch mode is running: `docker-compose logs -f backend`
2. Try rebuilding: `docker-compose up --build backend`

### MongoDB Connection Issues

**Check MongoDB is healthy:**
```bash
docker-compose ps
docker-compose logs mongodb
```

**Test connection:**
```bash
docker-compose exec mongodb mongosh trackit --eval "db.runCommand({ ping: 1 })"
```

### Redis Connection Issues

**Check Redis is healthy:**
```bash
docker-compose ps
docker-compose exec redis redis-cli ping
```

### Permission Issues (Linux/Mac)

If you encounter permission issues with node_modules:
```bash
# Fix ownership
sudo chown -R $USER:$USER frontend/node_modules
sudo chown -R $USER:$USER backend/node_modules
```

### Out of Memory

**Increase Docker memory:**
- Docker Desktop → Settings → Resources → Memory
- Allocate at least 4GB

### Clean Slate Restart

If everything is broken, start fresh:
```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild and start
docker-compose up --build
```

## Environment Variables

Environment variables can be configured in:
- `docker-compose.yml` - Default development values
- `frontend/.env.local` - Frontend-specific overrides (not in Docker)
- `backend/.env` - Backend-specific overrides (not in Docker)

## Health Checks

Services include health checks:
- **MongoDB**: Pings database every 10s
- **Redis**: Pings server every 10s

Check service health:
```bash
docker-compose ps
```

## Network

All services communicate via the `trackit-network` bridge network.

Service DNS names:
- `frontend` - Frontend container
- `backend` - Backend container
- `mongodb` - MongoDB container
- `redis` - Redis container

## Best Practices

1. **Always use `docker-compose down`** before shutting down your computer
2. **Don't commit `node_modules`** - they're handled by Docker volumes
3. **Use `docker-compose logs -f`** to debug issues
4. **Rebuild after dependency changes**: `docker-compose up --build`
5. **Keep Docker Desktop running** while developing

## Production

⚠️ **WARNING**: This Docker configuration is for **development only**.

For production:
- Use separate production Dockerfiles
- Remove volume mounts
- Use environment-specific configurations
- Add proper security configurations
- Use production-grade MongoDB and Redis

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
