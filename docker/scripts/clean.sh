#!/usr/bin/env bash
# Full cleanup — stop containers, remove images, and delete volumes.
# Usage: ./clean.sh [env] [--all]
#   env:   dev (default), prod, test
#   --all: clean all environments

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

clean_env() {
  local env="$1"
  echo "Cleaning TrackIt ($env)..."
  docker compose \
    -f "$DOCKER_DIR/docker-compose.yml" \
    -f "$DOCKER_DIR/docker-compose.$env.yml" \
    down -v --rmi local --remove-orphans
}

ENV="${1:-dev}"
ALL=false

for arg in "$@"; do
  case "$arg" in
    --all) ALL=true ;;
  esac
done

if [ "$ALL" = true ]; then
  for e in dev prod test; do
    clean_env "$e"
  done
else
  clean_env "$ENV"
fi

echo "Cleanup complete."
