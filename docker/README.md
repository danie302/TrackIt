# TrackIt Docker Configuration

Multi-environment Docker setup for TrackIt.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose V2+
- At least 4GB RAM allocated to Docker

## Structure

```
docker/
├── docker-compose.yml          # Base service definitions (shared)
├── docker-compose.dev.yml      # Development overrides (hot reload, ports)
├── docker-compose.prod.yml     # Production overrides (optimized builds)
├── docker-compose.test.yml     # Test overrides (test DB)
├── scripts/                    # Management scripts (bash)
│   ├── start.sh
│   ├── stop.sh
│   ├── restart.sh
│   ├── build.sh
│   ├── logs.sh
│   ├── seed.sh
│   ├── status.sh
│   └── clean.sh
└── seed/                       # Database seed data
```

## Quick Start

All scripts default to the `dev` environment. Run from the project root.

```bash
# Start all services (development)
./docker/scripts/start.sh

# Start in background
./docker/scripts/start.sh dev -d

# Start a specific service
./docker/scripts/start.sh dev backend

# Stop all services
./docker/scripts/stop.sh

# Stop and remove volumes (deletes data)
./docker/scripts/stop.sh dev -v

# Restart
./docker/scripts/restart.sh
./docker/scripts/restart.sh dev backend

# View logs (follows by default)
./docker/scripts/logs.sh
./docker/scripts/logs.sh dev backend

# Check status
./docker/scripts/status.sh

# Build images
./docker/scripts/build.sh
./docker/scripts/build.sh dev --no-cache

# Seed database
./docker/scripts/seed.sh
./docker/scripts/seed.sh --clean    # Reset + seed

# Full cleanup (removes containers, volumes, images)
./docker/scripts/clean.sh
./docker/scripts/clean.sh dev --all  # All environments
```

## Environment-Specific Usage

Pass the environment as the first argument:

```bash
# Production
./docker/scripts/start.sh prod -d
./docker/scripts/stop.sh prod
./docker/scripts/logs.sh prod backend

# Test
./docker/scripts/start.sh test
```

## Manual Docker Compose Commands

All compose files are in `docker/`. You must specify both the base and env override:

```bash
# Development
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d

# Production
docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d

# Test
docker compose -f docker/docker-compose.yml -f docker/docker-compose.test.yml up
```

## Services

| Service  | Dev Port | Prod Port | Description                         |
|----------|----------|-----------|-------------------------------------|
| frontend | 5173     | 80        | Vite dev server / Nginx (prod)      |
| backend  | 3000     | 3000      | NestJS dev server / Node (prod)     |
| mongodb  | 27017    | —         | MongoDB 7 database                  |
| redis    | 6379     | —         | Redis 7 cache                       |

## Environments

### Development (`dev`)
- Volume mounts for hot reload (frontend + backend source)
- All ports exposed to host
- Dev Dockerfiles (`Dockerfile.dev`)
- Seed data mounted into MongoDB

### Production (`prod`)
- Multi-stage production Dockerfiles (`Dockerfile.prod`)
- Frontend served via Nginx with API proxy
- No source volume mounts
- Environment variables read from host/`.env` file
- Resource limits and restart policies
- MongoDB auth enabled
- Redis password required

### Test (`test`)
- Separate test database (`trackit_test`)
- Backend runs `npm run test` as its command
- Uses dev Dockerfiles with source mounts

## Accessing Services (Development)

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **MongoDB:** mongodb://localhost:27017/trackit
- **Redis:** localhost:6379

## Data Persistence

Data is persisted via Docker named volumes: `mongodb_data`, `redis_data`.

To delete all data:
```bash
./docker/scripts/stop.sh dev -v
```

## Troubleshooting

**Ports in use:**
```bash
lsof -i :3000
lsof -i :5173
# Windows: netstat -ano | findstr :3000
```

**Full reset:**
```bash
./docker/scripts/clean.sh
./docker/scripts/start.sh
```

**Check health:**
```bash
./docker/scripts/status.sh
```
