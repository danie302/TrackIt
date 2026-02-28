#!/usr/bin/env bash
# Restart TrackIt Docker containers.
# Usage: ./restart.sh [env] [service]
#   env:     dev (default), prod, test
#   service: optional specific service to restart

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"
SERVICE="${2:-}"

echo "Restarting TrackIt ($ENV)..."
docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  restart $SERVICE
