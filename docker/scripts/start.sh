#!/usr/bin/env bash
# Start TrackIt Docker containers.
# Usage: ./start.sh [env] [service] [-d]
#   env:     dev (default), prod, test
#   service: optional specific service (backend, frontend, mongodb, redis)
#   -d:      run in detached mode

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"
shift 2>/dev/null || true

DETACH=""
SERVICE=""
for arg in "$@"; do
  case "$arg" in
    -d) DETACH="-d" ;;
    *)  SERVICE="$arg" ;;
  esac
done

echo "Starting TrackIt ($ENV)..."
docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  up $DETACH $SERVICE
