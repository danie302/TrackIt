#!/usr/bin/env bash
# Run database seed scripts.
# Usage: ./seed.sh [--clean]
#   --clean: run cleanup before seeding (resets all data)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(dirname "$SCRIPT_DIR")"

COMPOSE="docker compose -f $DOCKER_DIR/docker-compose.yml -f $DOCKER_DIR/docker-compose.dev.yml"

for arg in "$@"; do
  case "$arg" in
    --clean)
      echo "Cleaning database..."
      $COMPOSE exec backend npm run seed:clean
      ;;
  esac
done

echo "Seeding database..."
$COMPOSE exec backend npm run seed
