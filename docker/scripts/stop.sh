#!/usr/bin/env bash
# Stop TrackIt Docker containers.
# Usage: ./stop.sh [env] [-v]
#   env: dev (default), prod, test
#   -v:  also remove named volumes (deletes persisted data)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"
shift 2>/dev/null || true

VOLUMES=""
for arg in "$@"; do
  case "$arg" in
    -v) VOLUMES="-v" ;;
  esac
done

echo "Stopping TrackIt ($ENV)..."
docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  down $VOLUMES
