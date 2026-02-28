#!/usr/bin/env bash
# Show TrackIt Docker container status.
# Usage: ./status.sh [env]
#   env: dev (default), prod, test

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"

echo "TrackIt Container Status ($ENV):"
docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  ps
