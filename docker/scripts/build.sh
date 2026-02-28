#!/usr/bin/env bash
# Build TrackIt Docker images.
# Usage: ./build.sh [env] [service] [--no-cache]
#   env:        dev (default), prod, test
#   service:    optional specific service to build
#   --no-cache: build without using cache

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

ENV="${1:-dev}"
shift 2>/dev/null || true

NO_CACHE=""
SERVICE=""
for arg in "$@"; do
  case "$arg" in
    --no-cache) NO_CACHE="--no-cache" ;;
    *)          SERVICE="$arg" ;;
  esac
done

echo "Building TrackIt ($ENV)..."
docker compose \
  -f "$DOCKER_DIR/docker-compose.yml" \
  -f "$DOCKER_DIR/docker-compose.$ENV.yml" \
  build $NO_CACHE $SERVICE
